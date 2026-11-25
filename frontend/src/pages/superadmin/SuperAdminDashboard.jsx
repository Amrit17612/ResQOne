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
  FileText
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('organizations'); // 'organizations' | 'users' | 'audit'
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');

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

      if (appRes.data.success) setApplications(appRes.data.applications);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (logsRes.data.success) setAuditLogs(logsRes.data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, status, note) => {
    try {
      const { data } = await api.patch(`/organizations/applications/${appId}/status`, {
        status,
        note
      });
      if (data.success) {
        alert(`Application status updated to: ${status}`);
        fetchAdminData();
      }
    } catch (e) {
      alert('Error updating application status');
    }
  };

  const handleGenerateCredentials = async (appId) => {
    try {
      const { data } = await api.post(`/organizations/applications/${appId}/generate-credentials`);
      if (data.success) {
        setGeneratedLink(data.activationLink);
        alert('Credentials generated! Secure activation link created.');
        fetchAdminData();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Error generating credentials');
    }
  };

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
              The activation link has been recorded in the audit trail and sent to the applicant. The organization admin can set their master password using:
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] text-emerald-700 select-all break-all">
              {generatedLink}
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
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app._id} className="py-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{app.applicationId}</span>
                          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                            {app.organizationType}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{app.organizationName}</h4>
                        <p className="text-xs text-slate-500">
                          {app.address} • License/Reg: <strong>{app.registrationNumber}</strong>
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Signatory: <strong>{app.authorizedPersonName}</strong> ({app.authorizedPersonDesignation}) • Email: {app.officialEmail} • Phone: {app.contactNumber}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Super Admin Action Controls */}
                    <div className="pt-2 flex flex-wrap gap-2 text-xs">
                      {app.status === 'APPLICATION_SUBMITTED' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'UNDER_VERIFICATION', 'Verifying license with authorities')}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg"
                        >
                          Begin Document Verification
                        </button>
                      )}

                      {app.status === 'UNDER_VERIFICATION' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'DOCUMENTS_VERIFIED', 'Official registration documents verified')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg"
                          >
                            Mark Documents Verified
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'ADDITIONAL_INFO_REQUIRED', 'License copy missing municipal seal')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg"
                          >
                            Request Additional Info
                          </button>
                        </>
                      )}

                      {(app.status === 'DOCUMENTS_VERIFIED' || app.status === 'ADDITIONAL_INFO_REQUIRED') && (
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'APPROVED', 'Organization meets all emergency criteria')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg"
                        >
                          Approve Application
                        </button>
                      )}

                      {app.status === 'APPROVED' && (
                        <button
                          onClick={() => handleGenerateCredentials(app._id)}
                          className="bg-resq-blue hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Generate Secure Activation Link</span>
                        </button>
                      )}

                      {app.status !== 'REJECTED' && app.status !== 'CREDENTIALS_SENT' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) handleUpdateStatus(app._id, 'REJECTED', reason);
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg"
                        >
                          Reject
                        </button>
                      )}
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
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">{users.length}</span>
            </h3>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {users.map((u) => (
                <div key={u._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{u.name}</span>
                    <span className="text-slate-400">{u.email} • {u.phone}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
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
                    <span className="font-bold text-resq-blue">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-600">
                    Actor: <strong>{log.actorName}</strong> ({log.actorRole})
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Target: {log.resource} #{log.resourceId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
