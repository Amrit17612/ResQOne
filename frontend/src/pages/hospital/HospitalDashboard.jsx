import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';
import { Hospital as HospitalIcon, Check, X, Activity, UserPlus, Users, Shield, Building } from 'lucide-react';

export const HospitalDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('beds'); // 'beds' | 'staff'
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [allocationRequests, setAllocationRequests] = useState([]);

  // Hospital Staff Management state
  const [staffList, setStaffList] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    staffRole: 'DOCTOR'
  });

  useEffect(() => {
    fetchData();

    socket.on('allocation:requested', (newReq) => {
      setAllocationRequests((prev) => [newReq, ...prev]);
    });

    socket.on('allocation:updated', (updated) => {
      setAllocationRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    });

    return () => {
      socket.off('allocation:requested');
      socket.off('allocation:updated');
    };
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: hospData } = await api.get('/hospitals');
      if (hospData.success && hospData.hospitals.length > 0) {
        let availableHospitals = hospData.hospitals;

        // If the user belongs to a specific organization or hospital, scope strictly to their facility
        if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'CENTRAL_ADMIN') {
          const userOrgId = user.organizationId || user.hospitalId;
          if (userOrgId) {
            const matched = hospData.hospitals.filter(
              (h) => h._id === userOrgId || h.registrationNumber === user.badgeNumber
            );
            if (matched.length > 0) {
              availableHospitals = matched;
            }
          }
        }

        setHospitals(availableHospitals);
        setSelectedHospital(availableHospitals[0]);
      }

      const { data: reqData } = await api.get('/hospitals/allocations/requests');
      if (reqData.success) {
        setAllocationRequests(reqData.requests);
      }

      // Fetch Staff for this hospital
      try {
        const { data: staffData } = await api.get('/hospitals/staff/members');
        if (staffData.success) {
          setStaffList(staffData.staffMembers);
        }
      } catch (e) {
        // May be unassigned for generic admin view
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBedAdjust = async (category, field, delta) => {
    if (!selectedHospital) return;
    const current = selectedHospital.beds[category][field];
    const newCount = Math.max(0, current + delta);
    if (newCount === current) return;

    // 1. Instant Optimistic UI Update (0 millisecond lag on screen)
    const prevHospitalState = { ...selectedHospital };
    setSelectedHospital((prev) => ({
      ...prev,
      beds: {
        ...prev.beds,
        [category]: {
          ...prev.beds[category],
          [field]: newCount
        }
      }
    }));

    // 2. Sync to Backend in the background
    try {
      const payload = {
        bedCategory: category,
        [field]: newCount
      };
      const { data } = await api.patch(`/hospitals/${selectedHospital._id}/beds`, payload);
      if (data.success && data.beds) {
        setSelectedHospital((prev) => ({
          ...prev,
          beds: data.beds
        }));
      }
    } catch (e) {
      // Revert if network error
      setSelectedHospital(prevHospitalState);
      alert('Network error updating beds. Value restored.');
    }
  };

  const respondAllocation = async (requestId, status, approvedCount) => {
    try {
      const { data } = await api.patch(`/hospitals/allocations/requests/${requestId}`, {
        status,
        approvedCount
      });
      if (data.success) {
        alert(`Allocation ${status}`);
        fetchData();
      }
    } catch (e) {
      alert('Error responding to allocation request');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/hospitals/staff', newStaff);
      if (data.success) {
        alert(data.message);
        setShowStaffModal(false);
        setNewStaff({ name: '', email: '', phone: '', staffRole: 'DOCTOR' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating staff member');
    }
  };

  return (
    <DashboardLayout
      title="Hospital Emergency Triage, Bed Board & Staff Governance"
      subtitle="Critical Bed Quotas, Patient Transport Inflow & Scoped Hospital Staff Management"
    >
      <div className="space-y-6">
        {/* Hospital Facility Header (Fixed badge for hospital coordinator, selectable dropdown for super admin) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <HospitalIcon className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold uppercase text-slate-500">Active Hospital Facility:</span>
            {user?.role === 'SUPER_ADMIN' ? (
              <div className="flex items-center space-x-2">
                <select
                  value={selectedHospital?._id || ''}
                  onChange={(e) => {
                    const h = hospitals.find((item) => item._id === e.target.value);
                    setSelectedHospital(h);
                  }}
                  className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-600 outline-none"
                >
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.registrationNumber})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded">
                  Super Admin View-Only (Read-Only Live Audit)
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-black text-teal-900">
                  {selectedHospital?.name || 'City Cair Hospital'}
                </span>
                <span className="text-[11px] font-mono text-teal-700 bg-white/80 px-2 py-0.5 rounded border border-teal-200">
                  {selectedHospital?.registrationNumber || 'HOSP-DEL-9842'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('beds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'beds'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Bed Board & Allocations
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'staff'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Hospital Staff ({staffList.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'beds' ? (
          <>
            {/* Live Bed Inventory Matrix */}
            {selectedHospital && (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(selectedHospital.beds).map(([cat, stats]) => {
                  const available = stats.total - stats.occupied - stats.reserved;
                  return (
                    <div
                      key={cat}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                          {cat.replace(/_/g, ' ')}
                        </span>
                        <div className="text-3xl font-black text-slate-900 mb-2">
                          {available} <span className="text-xs font-normal text-slate-400">Avail</span>
                        </div>
                        <div className="text-xs text-slate-500 space-y-0.5">
                          <div>Total: <strong>{stats.total}</strong></div>
                          <div>Occupied: <strong>{stats.occupied}</strong></div>
                          <div>Reserved: <strong className="text-amber-600">{stats.reserved}</strong></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Occupancy</span>
                        {user?.role === 'SUPER_ADMIN' ? (
                          <span className="text-[11px] font-semibold text-slate-400 italic">Hospital Controlled</span>
                        ) : (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleBedAdjust(cat, 'occupied', 1)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold w-7 h-7 rounded-lg text-xs"
                              title="Increase Occupied Bed"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleBedAdjust(cat, 'occupied', -1)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold w-7 h-7 rounded-lg text-xs"
                              title="Decrease Occupied Bed"
                            >
                              -
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Incoming Patient Allocation Requests */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Activity className="w-5 h-5 text-resq-crimson" />
                <h2 className="text-lg font-bold text-slate-800">Incoming Central Allocation Requests</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {allocationRequests.map((req) => (
                  <div
                    key={req._id}
                    className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {req.incidentId?.referenceId || 'EMERGENCY-CALL'}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Category: {req.bedCategory}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          Requested: <strong>{req.requestedCount} Bed(s)</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {req.incidentId?.title || 'Mass casualty trauma transport'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>

                      {req.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => respondAllocation(req._id, 'ACCEPTED', req.requestedCount)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept ({req.requestedCount})</span>
                          </button>
                          <button
                            onClick={() => respondAllocation(req._id, 'REJECTED', 0)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Staff Management Tab (Strict Hospital Data Isolation) */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Hospital Internal Staff Roster</h3>
                <p className="text-xs text-slate-400">
                  Accounts provisioned strictly for this facility. Staff cannot access unrelated hospital data.
                </p>
              </div>
              <button
                onClick={() => setShowStaffModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
            </div>

            {staffList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No internal staff provisioned for this facility yet. Click "Add Staff Member" to onboard doctors or bed managers.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {staffList.map((member) => (
                  <div key={member._id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{member.name}</span>
                      <span className="text-slate-400">{member.email} • {member.phone}</span>
                    </div>
                    <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Add Hospital Staff */}
        {showStaffModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">Provision Hospital Staff Account</h3>
                <button
                  onClick={() => setShowStaffModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Staff Member Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, name: e.target.value.replace(/[^a-zA-Z\s'.]/g, '') })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.org"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Phone Number (10 Digits)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={newStaff.phone}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Assigned Role</label>
                  <select
                    value={newStaff.staffRole}
                    onChange={(e) => setNewStaff({ ...newStaff, staffRole: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                  >
                    <option value="DOCTOR">Doctor (Emergency / ICU)</option>
                    <option value="BED_MANAGER">Bed Inventory Manager</option>
                    <option value="EMERGENCY_COORDINATOR">Emergency Inflow Coordinator</option>
                    <option value="NURSE_IN_CHARGE">Nurse In-Charge</option>
                  </select>
                </div>

                <div className="pt-3 flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Establish Staff Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStaffModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    Cancel
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
