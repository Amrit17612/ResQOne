import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CentralOperationsMap } from '../../components/maps/CentralOperationsMap';
import {
  ShieldAlert,
  Users,
  LifeBuoy,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  MapPin,
  Waves,
  AlertTriangle
} from 'lucide-react';

export const DisasterAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('REQUESTS'); // 'REQUESTS' | 'STAFF' | 'UNITS' | 'MAP'
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [units, setUnits] = useState([]);
  const [actionMessage, setActionMessage] = useState('');
  const [declineModal, setDeclineModal] = useState({ open: false, requestId: null, reason: '' });

  // Staff provisioning state (Strictly Model B - Admin Only)
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    officialServiceId: '',
    rank: 'NDRF Specialist',
    specialization: 'Flood & Tactical Search',
    unitId: ''
  });

  useEffect(() => {
    fetchDisasterData();
    const interval = setInterval(fetchDisasterData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDisasterData = async () => {
    try {
      const [reqRes, staffRes, unitRes] = await Promise.all([
        api.get('/emergency-requests?departmentType=DISASTER_MANAGEMENT'),
        api.get('/disaster-admin/staff'),
        api.get('/disaster-admin/units')
      ]);

      if (reqRes.data.success) setRequests(reqRes.data.requests || []);
      if (staffRes.data.success) setStaff(staffRes.data.staff || []);
      if (unitRes.data.success) setUnits(unitRes.data.units || []);
    } catch (e) {
      console.warn('Disaster admin data fetch error:', e.message);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const { data } = await api.put(`/emergency-requests/${requestId}/accept`, {
        estimatedResponseMinutes: 15,
        deployedUnitIds: units.slice(0, 1).map(u => u._id)
      });
      if (data.success) {
        setActionMessage(`Disaster incident request accepted: ${data.request.requestId}`);
        fetchDisasterData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting disaster emergency request');
    }
  };

  const handleDeclineRequest = async () => {
    try {
      const { data } = await api.put(`/emergency-requests/${declineModal.requestId}/decline`, {
        declineReason: declineModal.reason
      });
      if (data.success) {
        setActionMessage(`Request declined: ${declineModal.requestId}`);
        setDeclineModal({ open: false, requestId: null, reason: '' });
        fetchDisasterData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error declining emergency request');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/disaster-admin/provision-staff', newStaff);
      if (data.success) {
        setActionMessage(`Disaster Officer provisioned: ${data.staff.staffId}. Activation link generated.`);
        setNewStaff({
          name: '',
          email: '',
          phone: '',
          officialServiceId: '',
          rank: 'NDRF Specialist',
          specialization: 'Flood & Tactical Search',
          unitId: ''
        });
        fetchDisasterData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to provision disaster personnel');
    }
  };

  return (
    <DashboardLayout
      title="Disaster Management Authority Command"
      subtitle="NDRF & SDRF Flood, Cyclone, Earthquake Tactical Operations & Department Coordination Grid"
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
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Requests</p>
              <p className="text-2xl font-black text-slate-800">{requests.filter(r => r.status === 'REQUEST_CREATED').length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg text-purple-700">
              <Waves className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Deployed Teams</p>
              <p className="text-2xl font-black text-slate-800">{requests.filter(r => r.status === 'ACCEPTED').length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total NDRF Staff</p>
              <p className="text-2xl font-black text-slate-800">{staff.length}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tactical Units</p>
              <p className="text-2xl font-black text-slate-800">{units.length}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'REQUESTS'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Radio className="w-4 h-4" /> Incoming Incident Alerts ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('MAP')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'MAP'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" /> Live Operational Map
          </button>
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'STAFF'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> Disaster Response Personnel ({staff.length})
          </button>
        </div>

        {/* Tab 1: Emergency Requests Queue */}
        {activeTab === 'REQUESTS' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-purple-600" /> Automated Department Dispatches & Routing Requests
            </h3>
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                No active disaster management incident dispatches at this moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map(reqItem => (
                  <div
                    key={reqItem._id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 bg-purple-100 text-purple-800 font-bold rounded">
                          {reqItem.requestId}
                        </span>
                        <span className={`text-xs px-2 py-0.5 font-bold rounded ${
                          reqItem.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                          reqItem.status === 'DECLINED' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {reqItem.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(reqItem.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {reqItem.incidentId?.title || 'Disaster Incident Deployment'}
                      </h4>
                      <p className="text-sm text-slate-600">
                        Category: <strong className="text-purple-700">{reqItem.incidentId?.category || 'DISASTER'}</strong> | Severity: <strong className="text-rose-600">{reqItem.incidentId?.severity || 'HIGH'}</strong>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {reqItem.incidentId?.location?.address || 'Incident Location Coordinates Recorded'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {reqItem.status === 'REQUEST_CREATED' && (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(reqItem._id)}
                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 shadow"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Accept & Deploy Team
                          </button>
                          <button
                            onClick={() => setDeclineModal({ open: true, requestId: reqItem._id, reason: '' })}
                            className="flex-1 md:flex-none px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" /> Decline
                          </button>
                        </>
                      )}
                      {reqItem.status === 'ACCEPTED' && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> NDRF Unit Mobilized
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Map */}
        {activeTab === 'MAP' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <CentralOperationsMap />
          </div>
        )}

        {/* Tab 3: Staff Provisioning */}
        {activeTab === 'STAFF' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" /> Provision Disaster Specialist
              </h3>
              <form onSubmit={handleCreateStaff} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-purple-500"
                    placeholder="Inspector Rajesh Verma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-purple-500"
                    placeholder="rajesh.ndrf@disaster.gov.in"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newStaff.phone}
                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value.replace(/\\D/g, '').slice(0, 10) })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-purple-500"
                    placeholder="9810123456"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rank / Designation</label>
                  <select
                    value={newStaff.rank}
                    onChange={e => setNewStaff({ ...newStaff, rank: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg"
                  >
                    <option value="NDRF Specialist">NDRF Specialist</option>
                    <option value="SDRF Commander">SDRF Commander</option>
                    <option value="Tactical Diver">Tactical Diver</option>
                    <option value="Disaster Relief Officer">Disaster Relief Officer</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Provision Officer (Admin Controlled)
                </button>
              </form>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" /> Active Roster ({staff.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                      <th className="p-2">Staff ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Rank</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staff.map(s => (
                      <tr key={s._id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-purple-700">{s.staffId || 'DIS-001'}</td>
                        <td className="p-2 font-bold text-slate-800">{s.name}</td>
                        <td className="p-2 text-slate-600">{s.rankOrDesignation || 'NDRF Officer'}</td>
                        <td className="p-2 text-slate-500">{s.email}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Decline Modal */}
        {declineModal.open && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-2">Decline Emergency Incident Request</h3>
              <p className="text-xs text-slate-500 mb-4">Please specify a mandatory reason for declining this response dispatch.</p>
              <textarea
                value={declineModal.reason}
                onChange={e => setDeclineModal({ ...declineModal, reason: e.target.value })}
                placeholder="e.g. NDRF units already engaged in simultaneous Yamuna flood surge evacuation."
                className="w-full text-xs p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 mb-4"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeclineModal({ open: false, requestId: null, reason: '' })}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  disabled={!declineModal.reason.trim()}
                  onClick={handleDeclineRequest}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

