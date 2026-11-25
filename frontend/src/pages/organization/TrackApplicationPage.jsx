import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Check
} from 'lucide-react';

// Verification pipeline stages in order
const PIPELINE_STAGES = [
  { key: 'APPLICATION_SUBMITTED', label: 'Application Submitted', desc: 'Received & Queued for Super Admin' },
  { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Central Admin initial screening' },
  { key: 'DOCUMENT_VERIFICATION', label: 'Document Verification', desc: 'License & credentials audit' },
  { key: 'FIELD_INSPECTION', label: 'Physical Site Verified', desc: 'GeoJSON GPS coordinates confirmed' },
  { key: 'APPROVED', label: 'Approved & Active', desc: 'Onboarded to ResQOne Emergency Grid' }
];

export const TrackApplicationPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Direct Track without OTP
  const handleDirectTrack = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/organizations/track-direct', {
        identifier: identifier.trim()
      });

      if (data.success) {
        setApplication(data.application);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No matching organization found for this Reference ID or Official Email.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine status index
  const getStageIndex = (status) => {
    switch (status) {
      case 'APPLICATION_SUBMITTED':
        return 0;
      case 'UNDER_REVIEW':
        return 1;
      case 'DOCUMENT_VERIFICATION':
        return 2;
      case 'FIELD_INSPECTION':
        return 3;
      case 'APPROVED':
      case 'CREDENTIALS_SENT':
      case 'ACTIVE':
        return 4;
      default:
        return 1;
    }
  };

  const currentStageIdx = application ? getStageIndex(application.status) : 0;
  const isRejected = application?.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 font-sans text-slate-100 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        {/* Top Header */}
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-4">
            <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-black">
              ResQ<span className="text-resq-crimson">One</span>
            </span>
          </NavLink>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Live Organization Application Tracking
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Check real-time verification pipeline progress using your Reference ID OR Registered Official Email
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl mb-8">
          <form onSubmit={handleDirectTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Enter Application Reference ID <span className="text-amber-400">OR</span> Official Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. ORG-20261125-0001  or  ayushjha9364@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-sm bg-slate-950/80 border border-slate-700 rounded-xl p-3.5 pr-28 text-white placeholder-slate-500 focus:ring-2 focus:ring-resq-blue outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  className="absolute right-2 top-2 bottom-2 px-5 bg-resq-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition shadow flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{loading ? 'Searching...' : 'Track'}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 No OTP required. Instant live status lookup directly from the centralized emergency verification grid.
            </p>
          </form>

          {error && (
            <div className="mt-4 bg-red-950/60 border border-red-500/40 p-3 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Real-time Status Card & Stepper Timeline */}
        {application && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fadeIn">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-700 gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-md border border-amber-800 inline-block mb-2">
                  {application.applicationId}
                </span>
                <h2 className="text-2xl font-black text-white">{application.organizationName}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {application.organizationType}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {application.officialEmail}
                  </span>
                </div>
              </div>

              <div>
                <span
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md inline-flex items-center gap-2 ${
                    isRejected
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : currentStageIdx === 4
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  {application.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Visual Circular Stepper with Connecting Line */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Multi-Stage Verification Pipeline Progress
              </h3>

              {isRejected ? (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200">
                  <p className="font-bold text-sm text-red-400 mb-1">Application Declined</p>
                  <p>Central Administration could not approve this onboarding request. Please reach out to administrative governance.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Desktop horizontal timeline */}
                  <div className="hidden md:flex items-center justify-between relative z-10">
                    {PIPELINE_STAGES.map((stage, idx) => {
                      const isCompleted = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div key={stage.key} className="flex flex-col items-center text-center max-w-[130px] flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${
                              isCompleted
                                ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-950'
                                : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                            }`}
                          >
                            {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : idx + 1}
                          </div>

                          <span
                            className={`text-xs font-bold mt-3 ${
                              isCurrent
                                ? 'text-cyan-400'
                                : isCompleted
                                ? 'text-slate-200'
                                : 'text-slate-500'
                            }`}
                          >
                            {stage.label}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{stage.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Horizontal connecting background line for desktop */}
                  <div className="hidden md:block absolute top-5 left-12 right-12 h-0.5 bg-slate-700 z-0">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${(currentStageIdx / (PIPELINE_STAGES.length - 1)) * 100}%` }}
                    ></div>
                  </div>

                  {/* Mobile vertical timeline */}
                  <div className="md:hidden space-y-6 relative pl-6 border-l-2 border-slate-700">
                    {PIPELINE_STAGES.map((stage, idx) => {
                      const isCompleted = idx <= currentStageIdx;
                      return (
                        <div key={stage.key} className="relative">
                          <div
                            className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-950'
                                : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                          </div>
                          <div>
                            <span className={`text-xs font-bold ${isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                              {stage.label}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">{stage.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Audit Status History */}
            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Live Audit Timestamp Trail
              </h4>
              <div className="space-y-2.5">
                {application.statusHistory && application.statusHistory.length > 0 ? (
                  application.statusHistory.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1"
                    >
                      <div>
                        <span className="font-bold text-emerald-400 mr-2">
                          {h.status?.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-slate-300">{h.note || 'Status updated'}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {h.updatedAt ? new Date(h.updatedAt).toLocaleString() : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-950/40 rounded-xl text-xs text-slate-400">
                    Application successfully registered and queued for verification.
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setApplication(null);
                  setIdentifier('');
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Track Another Organization</span>
              </button>

              <NavLink
                to="/"
                className="text-xs font-bold text-resq-blue hover:text-blue-400 transition"
              >
                Back to Home Grid →
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
