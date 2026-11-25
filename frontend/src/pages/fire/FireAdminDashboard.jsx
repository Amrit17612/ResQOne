import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Flame,
  PlusCircle,
  Building,
  Truck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Radio
} from 'lucide-react';

export const FireAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('STAFF'); // 'STAFF' | 'STATIONS' | 'UNITS'
  const [staff, setStaff] = useState([]);
  const [stations, setStations] = useState([]);
  const [units, setUnits] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // New Fire Staff form state (Strictly Model B - Admin-Only Provisioning)
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    officialServiceId: '',
    rank: 'Leading Firefighter',
    specialization: 'Foam Suppression & HAZMAT',
    stationId: '',
    unitId: ''
  });

  useEffect(() => {
    fetchFireData();
  }, []);

  const fetchFireData = async () => {
    try {
      const [staffRes, stnRes, unitRes] = await Promise.all([
        api.get('/fire-admin/staff'),
        api.get('/fire-admin/stations'),
        api.get('/fire-admin/units')
      ]);

      if (staffRes.data.success) setStaff(staffRes.data.staff || []);
      if (stnRes.data.success) setStations(stnRes.data.stations || []);
      if (unitRes.data.success) setUnits(unitRes.data.units || []);
    } catch (e) {
      console.warn('Fire data fetch note:', e.message);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/fire-admin/staff', newStaff);
      if (data.success) {
        setActionMessage(`Firefighter created! Unique ID: ${data.staff.staffId}. Activation email dispatched.`);
        setShowCreateModal(false);
        setNewStaff({
          name: '',
          email: '',
          phone: '',
          officialServiceId: '',
          rank: 'Leading Firefighter',
          specialization: 'Foam Suppression & HAZMAT',
          stationId: '',
          unitId: ''
        });
        fetchFireData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error provisioning firefighter');
    }
  };

  return (
    <DashboardLayout
      title="Fire & Rescue Administration Command"
      subtitle="Government Fire Personnel Provisioning, Fire Stations, Foam Tender Squads & Hydraulic Fleets"
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

        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Total Firefighters</span>
              <p className="text-2xl font-black text-red-600">{staff.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Fire Stations</span>
              <p className="text-2xl font-black text-slate-800">{stations.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Rescue Squads</span>
              <p className="text-2xl font-black text-orange-600">{units.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Water Tenders Ready</span>
              <p className="text-2xl font-black text-emerald-600">
                {units.filter((u) => u.status === 'AVAILABLE').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Controls & Provision Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('STAFF')}
              className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
                activeTab === 'STAFF'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Fire Personnel ({staff.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('STATIONS')}
              className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
                activeTab === 'STATIONS'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Fire Stations</span>
            </button>
            <button
              onClick={() => setActiveTab('UNITS')}
              className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
                activeTab === 'UNITS'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Tender Teams</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Fire Staff Account</span>
          </button>
        </div>

        {/* TAB 1: FIREFIGHTERS LIST */}
        {activeTab === 'STAFF' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Firefighters & Rescue Specialists Directory</h3>
              <span className="text-xs bg-red-50 text-red-700 font-bold px-2.5 py-0.5 rounded border border-red-200">
                Model B: Admin Provisioned (No Public Signup)
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {staff.map((fireman) => (
                <div key={fireman._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                        {fireman.staffId || 'FIRE-OFFICER'}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{fireman.name}</span>
                      <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-700">
                        {fireman.rankOrDesignation || 'Firefighter'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      📧 {fireman.email} · 📞 {fireman.phone} · Specialty: {fireman.specialty || 'Foam Tender'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      fireman.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {fireman.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STATIONS */}
        {activeTab === 'STATIONS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100">
              Operational Fire Stations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stations.map((stn) => (
                <div key={stn._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-red-700 font-bold">{stn.stationId}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{stn.name}</h4>
                  <p className="text-slate-500">{stn.address}</p>
                  <p className="text-[11px] text-slate-400">Station Officer: {stn.officerInChargeName || 'Station Commander'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: UNITS */}
        {activeTab === 'UNITS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100">
              Water Tenders & Rescue Squads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {units.map((unit) => (
                <div key={unit._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-red-700 font-bold">{unit.unitId}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      {unit.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{unit.name}</h4>
                  <p className="text-slate-500">Unit Type: {unit.unitType}</p>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Vehicle: {unit.assignedVehicleId?.unitIdentifier || 'FIRE-TENDER-09'}</span>
                    <span className="font-semibold text-red-700">Foam & Hydraulic Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROVISIONING MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Provision Government Fire Account</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Firefighter Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Chandra"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Official Fire Department Email</label>
                  <input
                    type="email"
                    required
                    placeholder="firefighter.delhi@fireservice.gov.in"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Mobile (10 Digits)</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Rank / Designation</label>
                    <select
                      value={newStaff.rank}
                      onChange={(e) => setNewStaff({ ...newStaff, rank: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                    >
                      <option value="Station Officer">Station Officer</option>
                      <option value="Leading Firefighter">Leading Firefighter</option>
                      <option value="Firefighter Operator">Firefighter Operator</option>
                      <option value="Fire Truck Driver">Fire Truck Driver</option>
                      <option value="Rescue Specialist">Rescue Specialist</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-[11px]">
                  🔒 A unique Fire ID (e.g. FIRE-001) and single-use activation invitation will be dispatched to this official email.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow cursor-pointer"
                  >
                    Provision Firefighter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

