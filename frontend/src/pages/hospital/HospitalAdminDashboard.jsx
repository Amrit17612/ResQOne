import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Stethoscope,
  Truck,
  Bed,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Building,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const HospitalAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('STAFF_APPLICATIONS'); // 'STAFF_APPLICATIONS' | 'DOCTORS' | 'DRIVERS' | 'BEDS'
  const [applications, setApplications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const orgId = user?.organizationId;

  useEffect(() => {
    if (orgId) {
      fetchApplications();
    } else {
      setLoading(false);
    }
    fetchStaff();
  }, [orgId]);

  const fetchApplications = async () => {
    if (!orgId) return;
    try {
      const { data } = await api.get(`/staff-applications/organization/${orgId}`);
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.warn('Applications fetch note:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data } = await api.get(`/hospitals/staff`);
      if (data.success) {
        const docs = data.staff.filter((s) => s.role === 'DOCTOR' || s.specialty);
        const drvs = data.staff.filter((s) => s.role === 'AMBULANCE_DRIVER' || s.role === 'AMBULANCE_PARAMEDIC');
        setDoctors(docs);
        setDrivers(drvs);
      }
    } catch (e) {
      console.warn('Staff fetch note:', e.message);
    }
  };

  const handleApprove = async (appId) => {
    try {
      const remarks = prompt('Enter approval notes for applicant:');
      const { data } = await api.patch(`/staff-applications/${appId}/approve`, {
        adminRemarks: remarks || 'Credentials verified by Hospital Admin'
      });
      if (data.success) {
        setActionMessage(`Approved! Single-use activation link sent. Generated Staff ID: ${data.assignedStaffId}`);
        fetchApplications();
        fetchStaff();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Error approving application');
    }
  };

  const handleReject = async (appId) => {
    try {
      const reason = prompt('Please enter reason for rejecting this staff application:');
      if (!reason) return;
      const { data } = await api.patch(`/staff-applications/${appId}/reject`, {
        rejectionReason: reason
      });
      if (data.success) {
        setActionMessage(`Application rejected and applicant notified.`);
        fetchApplications();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Error rejecting application');
    }
  };

  return (
    <DashboardLayout
      title="Hospital Administration Command"
      subtitle="Staff Application Verification, Doctor Rosters, Ambulance Drivers & Bed Isolation"
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

        {!orgId && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
            <Building className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Hospital Entity Association Pending</p>
              <p className="text-xs text-amber-700">Your coordinator profile does not have an active organization ID associated. Hospital staff applications and facility management require an approved organization profile.</p>
            </div>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Pending Applications</span>
              <p className="text-2xl font-black text-amber-600">
                {applications.filter((a) => a.status === 'APPLICATION_SUBMITTED').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Active Doctors</span>
              <p className="text-2xl font-black text-indigo-700">{doctors.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Active Drivers</span>
              <p className="text-2xl font-black text-emerald-600">{drivers.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Total Approved Staff</span>
              <p className="text-2xl font-black text-slate-800">
                {applications.filter((a) => a.status === 'APPROVED' || a.status === 'ACCOUNT_ACTIVE').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('STAFF_APPLICATIONS')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'STAFF_APPLICATIONS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Applications ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('DOCTORS')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'DOCTORS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctors & Specialists</span>
          </button>
          <button
            onClick={() => setActiveTab('DRIVERS')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'DRIVERS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Ambulance Drivers</span>
          </button>
        </div>

        {/* TAB 1: STAFF APPLICATIONS QUEUE (MODEL A ISOLATION) */}
        {activeTab === 'STAFF_APPLICATIONS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Incoming Staff Applications for This Hospital</h3>
                <p className="text-xs text-slate-500">
                  Strict Hospital Isolation: Applications submitted to other hospitals are not visible here.
                </p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
                Hospital Verification Queue
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No pending staff applications for this hospital facility.
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {app.applicationId}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{app.fullName}</span>
                        <span className="text-[10px] bg-slate-200 font-bold px-2 py-0.5 rounded text-slate-700">
                          {app.requestedRole.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        📧 {app.email} · 📞 {app.phone} · 📍 {app.address}
                      </p>
                      {app.specialty && (
                        <p className="text-indigo-800 text-[11px] font-semibold mt-1">
                          Specialty: {app.specialty} · Reg: {app.professionalRegistrationNumber || 'MCI-Verified'}
                        </p>
                      )}
                      {app.drivingLicenseNumber && (
                        <p className="text-amber-800 text-[11px] font-semibold mt-1">
                          License: {app.drivingLicenseNumber} ({app.vehicleCategory})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          app.status === 'APPROVED' || app.status === 'ACCOUNT_ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>

                      {app.status === 'APPLICATION_SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleApprove(app.applicationId)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Issue ID</span>
                          </button>
                          <button
                            onClick={() => handleReject(app.applicationId)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCTORS DIRECTORY */}
        {activeTab === 'DOCTORS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100">
              Verified Emergency Doctors & Specialists
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {doctors.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-indigo-700 font-bold text-xs">{doc.staffId || `DOC-${idx + 1}`}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      AVAILABLE
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">{doc.specialty || 'Emergency Trauma Specialist'}</p>
                  <p className="text-[11px] text-slate-400">Shift: Day Duty (08:00 - 16:00)</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AMBULANCE DRIVERS DIRECTORY */}
        {activeTab === 'DRIVERS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100">
              Verified Ambulance Drivers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {drivers.map((drv, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-amber-700 font-bold text-xs">{drv.staffId || `DRV-${idx + 1}`}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{drv.name}</h4>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      AVAILABLE
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">Licensed for ALS/BLS Fleet</p>
                  <p className="text-[11px] text-slate-400">Phone: {drv.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

