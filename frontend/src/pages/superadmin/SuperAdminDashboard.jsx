import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import {
  Settings,
  Shield,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Key,
  Clock,
  Database,
  Activity,
  FileText,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  Eye,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Send,
  Sparkles,
  Search,
  Check
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('organizations'); // 'organizations' | 'users' | 'audit'
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');
  const [selectedApp, setSelectedApp] = useState(null); // Detailed review modal
  const [rejectingApp, setRejectingApp] = useState(null); // Dedicated Rejection modal
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [appRes, usersRes, logsRes] = await Promise.all([
        api.get('/organizations/applications'),
        api.get('/operations/users'),
        api.get('/operations/audit-logs')
      ]);

      if (appRes.data.success) {
        setApplications(appRes.data.applications);
        // keep selectedApp in sync if open
        if (selectedApp) {
          const updated = appRes.data.applications.find(a => a._id === selectedApp._id);
          if (updated) setSelectedApp(updated);
        }
      }
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (logsRes.data.success) setAuditLogs(logsRes.data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, status, note) => {
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/organizations/applications/${appId}/status`, {
        status,
        note: note || adminNoteInput || `Status transitioned to ${status}`
      });
      if (data.success) {
        alert(`Application status updated to: ${status}. Notification dispatched to official email.`);
        setAdminNoteInput('');
        await fetchAdminData();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating application status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateCredentials = async (appId) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/organizations/applications/${appId}/generate-credentials`);
      if (data.success) {
        setGeneratedLink(data.activationLink);
        alert('Credentials generated! Single-use activation link dispatched to official email.');
        await fetchAdminData();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Error generating credentials');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'SUCCESSFULLY_REGISTERED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">APPROVED & ACTIVE</span>;
      case 'ACTIVATION_PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">ACTIVATION LINK SENT</span>;
      case 'DOCUMENT_VERIFIED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">DOCUMENTS VERIFIED</span>;
      case 'UNDER_INITIAL_REVIEW':
      case 'UNDER_VERIFICATION':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">UNDER INITIAL REVIEW</span>;
      case 'ADDITIONAL_INFORMATION_REQUIRED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">INFO REQUIRED</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">REJECTED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">APPLICATION SUBMITTED</span>;
    }
  };

  const pipelineStages = [
    { key: 'APPLICATION_SUBMITTED', label: 'Application Submitted' },
    { key: 'UNDER_INITIAL_REVIEW', label: 'Under Initial Review' },
    { key: 'DOCUMENT_VERIFIED', label: 'Document Verified' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'ACTIVATION_PENDING', label: 'Activated & Live' }
  ];

  return (
    <DashboardLayout
      title="Platform Super Administration & Governance"
      subtitle="Organization Verification, Multi-Agency RBAC Matrix, Credential Generation & Forensic Audit Trail"
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400">Onboarding Applications</span>
              <div className="text-2xl font-black text-slate-800">{applications.length}</div>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-600">Active System Users</span>
              <div className="text-2xl font-black text-emerald-600">{users.length}</div>
            </div>
            <Users className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400">Audit Logs</span>
              <div className="text-2xl font-black text-slate-800">{auditLogs.length} Records</div>
            </div>
            <Shield className="w-8 h-8 text-slate-700" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-600">Database Engine</span>
              <div className="text-2xl font-black text-emerald-600">MongoDB 7.0</div>
            </div>
            <Database className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        {/* Generated Activation Link Notification Modal/Banner */}
        {generatedLink && (
          <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-xs text-emerald-900 space-y-2">
            <span className="font-bold flex items-center space-x-1.5 text-sm text-emerald-800">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Official Account Activation Link Dispatched</span>
            </span>
            <p className="text-slate-600">
              The single-use activation link has been sent to the applicant's official email. They can establish their master password at:
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] text-emerald-700 select-all break-all flex justify-between items-center">
              <span>{generatedLink}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  alert('Copied activation link to clipboard!');
                }}
                className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded text-[10px] ml-2"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('organizations')}
            className={`pb-3 transition border-b-2 ${
              activeTab === 'organizations'
                ? 'border-resq-blue text-resq-blue'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Organization Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 transition border-b-2 ${
              activeTab === 'users'
                ? 'border-resq-blue text-resq-blue'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Authorized Personnel Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 transition border-b-2 ${
              activeTab === 'audit'
                ? 'border-resq-blue text-resq-blue'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Forensic Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Organization Applications Management */}
        {activeTab === 'organizations' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Organization Onboarding Verification Pipeline</span>
              <span className="text-xs text-slate-400">Multi-Tier Workflow Enforcement</span>
            </h3>

            {applications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No organization applications submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-white border px-2 py-0.5 rounded">
                            {app.applicationId}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded">
                            {app.organizationType}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mt-1">{app.organizationName}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.address || 'Address registered on map'}</span>
                          </span>
                          <span>•</span>
                          <span>Reg No: <strong className="text-slate-800">{app.registrationNumber}</strong></span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.officialEmail}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {getStatusBadge(app.status)}
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Detailed Review</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Step Advance Toolbar */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-2 text-slate-500 font-medium">
                        <Activity className="w-4 h-4 text-resq-blue" />
                        <span>Action Workflow Controls:</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Step 1: Initial Review */}
                        {app.status === 'APPLICATION_SUBMITTED' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus(app._id, 'UNDER_INITIAL_REVIEW', 'Under screening by Super Admin')}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            Mark Under Initial Review
                          </button>
                        )}

                        {/* Step 2: Document Verification */}
                        {(app.status === 'APPLICATION_SUBMITTED' || app.status === 'UNDER_INITIAL_REVIEW') && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus(app._id, 'DOCUMENT_VERIFIED', 'Official registration documents and license verified')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            Mark Documents Verified
                          </button>
                        )}

                        {/* Step 3: Approve Application */}
                        {(app.status === 'DOCUMENT_VERIFIED' || app.status === 'UNDER_INITIAL_REVIEW' || app.status === 'ADDITIONAL_INFORMATION_REQUIRED') && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleUpdateStatus(app._id, 'APPROVED', 'Organization meets all emergency criteria and is approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-sm flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve Application</span>
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => {
                                const note = prompt('Enter clarification required for applicant:');
                                if (note) handleUpdateStatus(app._id, 'ADDITIONAL_INFORMATION_REQUIRED', note);
                              }}
                              className="bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 font-bold px-3 py-1.5 rounded-lg"
                            >
                              Request Info
                            </button>
                          </>
                        )}

                        {/* Step 4: Generate Credentials Activation Link */}
                        {app.status === 'APPROVED' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleGenerateCredentials(app._id)}
                            className="bg-resq-blue hover:bg-blue-600 text-white font-black px-4 py-1.5 rounded-lg shadow flex items-center space-x-1.5 animate-pulse"
                          >
                            <Key className="w-4 h-4" />
                            <span>Dispatch Activation Credentials Link</span>
                          </button>
                        )}

                        {/* Activation Link Already Sent */}
                        {(app.status === 'ACTIVATION_PENDING' || app.status === 'CREDENTIALS_SENT') && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleGenerateCredentials(app._id)}
                            className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                          >
                            <Key className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Resend Activation Email</span>
                          </button>
                        )}

                        {/* Reject Option with Dedicated Reason Modal */}
                        {app.status !== 'APPROVED' && app.status !== 'ACTIVATION_PENDING' && app.status !== 'REJECTED' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => {
                              setRejectingApp(app);
                              setRejectionReason('');
                            }}
                            className="text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-bold border border-rose-200"
                          >
                            Reject Application
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Users Directory */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between mb-4">
              <span>Authorized Department & Citizen Personnel</span>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">{users.length} Active</span>
            </h3>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {users.map((u) => (
                <div key={u._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">{u.name}</span>
                    <span className="text-slate-500">{u.email} • {u.phone}</span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Immutable Audit Trail */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between mb-4">
              <span>Immutable Forensic Audit Trail</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Tamper-Evident</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log._id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Review & Decision Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-bold">
                      {selectedApp.applicationId}
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded">
                      {selectedApp.organizationType}
                    </span>
                  </div>
                  <h3 className="text-lg font-black mt-1">{selectedApp.organizationName}</h3>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-slate-400 hover:text-white font-bold text-xl px-2 py-1"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
                {/* Visual Pipeline Progress */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-3 text-[11px]">
                    Current Verification Progress
                  </span>
                  <div className="flex items-center justify-between text-center relative">
                    {pipelineStages.map((stg, idx) => {
                      const isCompleted =
                        (selectedApp.status === 'APPROVED' && idx <= 3) ||
                        (selectedApp.status === 'ACTIVATION_PENDING' && idx <= 4) ||
                        (selectedApp.status === 'DOCUMENT_VERIFIED' && idx <= 2) ||
                        (selectedApp.status === 'UNDER_INITIAL_REVIEW' && idx <= 1) ||
                        idx === 0;

                      return (
                        <div key={stg.key} className="flex-1 flex flex-col items-center z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isCompleted
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 mt-1 max-w-[80px]">
                            {stg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2-Column Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Authorized Signatory */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Authorized Representative</span>
                    </span>
                    <div className="space-y-1">
                      <div>Name: <strong className="text-slate-900">{selectedApp.authorizedPersonName}</strong></div>
                      <div>Designation: <strong>{selectedApp.authorizedPersonDesignation}</strong></div>
                      <div>Official Email: <strong>{selectedApp.officialEmail}</strong></div>
                      <div>Phone: <strong>{selectedApp.contactNumber}</strong></div>
                    </div>
                  </div>

                  {/* Statutory & Location Credentials */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Facility & Geo-Coordinates</span>
                    </span>
                    <div className="space-y-1">
                      <div>Registration / License: <strong className="text-slate-900">{selectedApp.registrationNumber}</strong></div>
                      <div>Physical Address: <strong>{selectedApp.address}</strong></div>
                      <div>State / District: <strong>{selectedApp.state || 'N/A'}, {selectedApp.district || 'N/A'}</strong></div>
                      <div>
                        Coordinates: <strong className="font-mono text-emerald-700">
                          {selectedApp.location?.coordinates ? `${selectedApp.location.coordinates[1]}, ${selectedApp.location.coordinates[0]}` : 'GeoJSON Pinned'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Audit Trail */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Application Status Event History
                  </span>
                  <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
                    {selectedApp.statusHistory?.map((h, i) => (
                      <div key={i} className="py-2 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800">{h.status}</span>
                          <span className="text-slate-500 ml-2">— {h.note}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(h.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Custom Transition Note */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">Super Admin Transition Remarks / Notes:</label>
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Enter notes or requirements for this status change..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 text-xs"
                >
                  Close
                </button>

                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Step 2: Mark Documents Verified */}
                  {(selectedApp.status === 'APPLICATION_SUBMITTED' || selectedApp.status === 'UNDER_INITIAL_REVIEW') && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedApp._id, 'DOCUMENT_VERIFIED')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm"
                    >
                      ✓ Mark Documents Verified
                    </button>
                  )}

                  {/* Step 3: Approve Application */}
                  {(selectedApp.status === 'DOCUMENT_VERIFIED' || selectedApp.status === 'UNDER_INITIAL_REVIEW' || selectedApp.status === 'ADDITIONAL_INFORMATION_REQUIRED') && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedApp._id, 'APPROVED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Organization</span>
                    </button>
                  )}

                  {/* Step 4: Generate Credentials Activation Link */}
                  {selectedApp.status === 'APPROVED' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleGenerateCredentials(selectedApp._id)}
                      className="bg-resq-blue hover:bg-blue-600 text-white font-black px-5 py-2 rounded-lg shadow flex items-center space-x-1.5 animate-pulse"
                    >
                      <Key className="w-4 h-4" />
                      <span>Dispatch Activation Credentials Link</span>
                    </button>
                  )}

                  {/* If Already sent */}
                  {selectedApp.status === 'ACTIVATION_PENDING' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleGenerateCredentials(selectedApp._id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                    >
                      Resend Activation Email
                    </button>
                  )}
                  {/* Reject Option inside Modal */}
                  {selectedApp.status !== 'APPROVED' && selectedApp.status !== 'ACTIVATION_PENDING' && selectedApp.status !== 'REJECTED' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => {
                        setRejectingApp(selectedApp);
                        setRejectionReason('');
                      }}
                      className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg font-bold border border-rose-200"
                    >
                      Reject Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Rejection Modal with Reason */}
        {rejectingApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-rose-200 overflow-hidden">
              <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-base">Reject Organization Application</h3>
                </div>
                <button
                  onClick={() => setRejectingApp(null)}
                  className="text-rose-200 hover:text-white font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700">
                <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900 block text-sm">
                    {rejectingApp.organizationName}
                  </span>
                  <p className="text-rose-700">
                    Application ID: <strong>{rejectingApp.applicationId}</strong> • Official Email: <strong>{rejectingApp.officialEmail}</strong>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 text-xs block">
                    Reason for Rejection <span className="text-rose-600">*</span> (This will be sent directly to applicant's email):
                  </label>
                  <textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Incomplete statutory hospital registration certificate, or municipal health license copy expired on 2025-10-12..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    The applicant will receive a formal notification email with this exact reason and guidance for re-applying.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end space-x-3 text-xs">
                <button
                  type="button"
                  onClick={() => setRejectingApp(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !rejectionReason.trim()}
                  onClick={async () => {
                    if (!rejectionReason.trim()) {
                      alert('Please specify a rejection reason.');
                      return;
                    }
                    await handleUpdateStatus(rejectingApp._id, 'REJECTED', rejectionReason.trim());
                    setRejectingApp(null);
                    if (selectedApp?._id === rejectingApp._id) {
                      setSelectedApp(null);
                    }
                  }}
                  className={`px-5 py-2 rounded-lg font-bold text-white shadow-sm transition ${
                    !rejectionReason.trim()
                      ? 'bg-rose-300 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {actionLoading ? 'Processing...' : 'Confirm Rejection & Dispatch Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
