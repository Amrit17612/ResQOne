import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CentralOperationsMap } from '../../components/maps/CentralOperationsMap';
import {
  Home,
  Users,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MapPin,
  Clock,
  Radio,
  BedDouble,
  ShieldCheck
} from 'lucide-react';

export const ShelterAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('REQUESTS'); // 'REQUESTS' | 'SHELTERS' | 'MAP'
  const [requests, setRequests] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [actionMessage, setActionMessage] = useState('');

  // New shelter creation state
  const [newShelter, setNewShelter] = useState({
    name: '',
    address: 'Central Community Hall, Zone 4',
    totalCapacity: 200,
    contactPerson: '',
    phone: ''
  });

  useEffect(() => {
    fetchShelterData();
    const interval = setInterval(fetchShelterData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchShelterData = async () => {
    try {
      const [reqRes, shelterRes] = await Promise.all([
        api.get('/emergency-requests?departmentType=SHELTER'),
        api.get('/shelter-admin')
      ]);

      if (reqRes.data.success) setRequests(reqRes.data.requests || []);
      if (shelterRes.data.success) setShelters(shelterRes.data.shelters || []);
    } catch (e) {
      console.warn('Shelter fetch error:', e.message);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const { data } = await api.put(`/emergency-requests/${requestId}/accept`, {
        estimatedResponseMinutes: 10
      });
      if (data.success) {
        setActionMessage(`Shelter Evacuation Request Accepted: ${data.request.requestId}`);
        fetchShelterData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting shelter request');
    }
  };

  const handleCreateShelter = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/shelter-admin', newShelter);
      if (data.success) {
        setActionMessage(`Shelter registered: ${data.shelter.name}`);
        setNewShelter({
          name: '',
          address: 'Central Community Hall, Zone 4',
          totalCapacity: 200,
          contactPerson: '',
          phone: ''
        });
        fetchShelterData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering shelter');
    }
  };

  const handleUpdateOccupancy = async (id, delta) => {
    const target = shelters.find(s => s._id === id);
    if (!target) return;
    const newOcc = Math.max(0, (target.occupiedCapacity || 0) + delta);
    try {
      await api.patch(`/shelter-admin/${id}/capacity`, { occupiedCapacity: newOcc });
      fetchShelterData();
    } catch (err) {
      alert('Error updating capacity');
    }
  };

  return (
    <DashboardLayout
      title="Shelter & Evacuation Administration Command"
      subtitle="Relief Camp Occupancy, Bed Allotment, Food & Water Supplies, Evacuee Intake Registry"
    >
      <div className="space-y-6">
        {actionMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 p-3 rounded-xl text-emerald-200 text-xs flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {actionMessage}
            </span>
            <button onClick={() => setActionMessage('')} className="text-emerald-400 hover:text-white font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Evacuation Inquiries</p>
              <p className="text-2xl font-black text-slate-800">{requests.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-700">
              <Radio className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Operational Shelters</p>
              <p className="text-2xl font-black text-slate-800">{shelters.length}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
              <Home className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Bed Capacity</p>
              <p className="text-2xl font-black text-slate-800">{shelters.reduce((acc, s) => acc + (s.totalCapacity || 0), 0)}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Current Evacuees</p>
              <p className="text-2xl font-black text-slate-800">{shelters.reduce((acc, s) => acc + (s.occupiedCapacity || 0), 0)}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg text-rose-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'REQUESTS'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Radio className="w-4 h-4" /> Incoming Evacuation Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('SHELTERS')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'SHELTERS'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home className="w-4 h-4" /> Shelter Facilities & Capacity ({shelters.length})
          </button>
          <button
            onClick={() => setActiveTab('MAP')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'MAP'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" /> Evacuation Camp Map
          </button>
        </div>

        {/* Tab 1: Requests */}
        {activeTab === 'REQUESTS' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                No active shelter evacuation requests pending.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map(reqItem => (
                  <div
                    key={reqItem._id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded">
                          {reqItem.requestId}
                        </span>
                        <span className={`text-xs px-2 py-0.5 font-bold rounded ${
                          reqItem.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reqItem.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {reqItem.incidentId?.title || 'Emergency Evacuation Dispatch'}
                      </h4>
                      <p className="text-sm text-slate-600">
                        Incident: <strong>{reqItem.incidentId?.category}</strong> | Evacuee Quota Required: <strong className="text-indigo-600">{reqItem.evacuationCountRequired || 50} Citizens</strong>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {reqItem.incidentId?.location?.address || 'Incident coordinates registered'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {reqItem.status === 'REQUEST_CREATED' && (
                        <button
                          onClick={() => handleAcceptRequest(reqItem._id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Reserve Evacuation Capacity
                        </button>
                      )}
                      {reqItem.status === 'ACCEPTED' && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Shelter Evacuation Center Ready
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Shelters List & Management */}
        {activeTab === 'SHELTERS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" /> Add Shelter Facility
              </h3>
              <form onSubmit={handleCreateShelter} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shelter / Hall Name</label>
                  <input
                    type="text"
                    required
                    value={newShelter.name}
                    onChange={e => setNewShelter({ ...newShelter, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                    placeholder="Sector 12 Stadium Relief Camp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Bed Capacity</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newShelter.totalCapacity}
                    onChange={e => setNewShelter({ ...newShelter, totalCapacity: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address / Landmark</label>
                  <input
                    type="text"
                    required
                    value={newShelter.address}
                    onChange={e => setNewShelter({ ...newShelter, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Officer Name</label>
                  <input
                    type="text"
                    required
                    value={newShelter.contactPerson}
                    onChange={e => setNewShelter({ ...newShelter, contactPerson: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg"
                    placeholder="Camp Officer Ramesh"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Register Relief Facility
                </button>
              </form>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" /> Facility Occupancy & Bed Allocation
              </h3>
              <div className="space-y-4">
                {shelters.map(s => {
                  const pct = Math.min(100, Math.round(((s.occupiedCapacity || 0) / (s.totalCapacity || 1)) * 100));
                  return (
                    <div key={s._id} className="p-4 border rounded-xl bg-slate-50 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          s.status === 'FULL' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{s.location?.address} | Contact: {s.contactPerson} ({s.phone})</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${pct > 85 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">Occupancy: {s.occupiedCapacity} / {s.totalCapacity} ({pct}%)</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateOccupancy(s._id, -5)}
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                          >
                            -5 Evacuees
                          </button>
                          <button
                            onClick={() => handleUpdateOccupancy(s._id, 5)}
                            className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold hover:bg-indigo-700"
                          >
                            +5 Evacuees
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Map */}
        {activeTab === 'MAP' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <CentralOperationsMap />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

