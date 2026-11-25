import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import CitizenLiveTracking from '../../components/citizen/CitizenLiveTracking';
import api from '../../services/api';
import { Search, Compass, AlertCircle, RefreshCw, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

export const LiveIncidentTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const [trackInput, setTrackInput] = useState(initialRef);
  const [trackedIncident, setTrackedIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentIncidents, setRecentIncidents] = useState([]);

  useEffect(() => {
    if (initialRef) {
      performTracking(initialRef);
    }
  }, [initialRef]);

  const performTracking = async (refId) => {
    if (!refId || !refId.trim()) return;
    setLoading(true);
    setError('');

    try {
      const cleanRef = refId.trim().toUpperCase();
      const { data } = await api.get(`/incidents/track/${cleanRef}`);
      if (data.success && data.incident) {
        setTrackedIncident(data.incident);
        // Save to recent searches
        setRecentIncidents((prev) => {
          const filtered = prev.filter((item) => item.referenceId !== data.incident.referenceId);
          return [data.incident, ...filtered].slice(0, 5);
        });
      } else {
        setError('No emergency incident record matches this reference number.');
        setTrackedIncident(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Incident reference not found. Please verify the Reference ID format (e.g. RESQ-20261125-0001).'
      );
      setTrackedIncident(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    setSearchParams({ ref: trackInput.trim().toUpperCase() });
    performTracking(trackInput);
  };

  return (
    <DashboardLayout
      title="Live Emergency Tracking & Telematics"
      subtitle="Full-Screen GPS Radar, Field Unit Telemetry & Real-Time Incident Status Stepper"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Search Header Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-resq-blue mb-1">
                <Compass className="w-5 h-5 animate-spin-slow" />
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  Track Dispatched Emergency Units
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Enter your unique incident reference code to view live GPS coordinates of dispatched ambulances, police, or fire trucks.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. RESQ-20261125-0001"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono font-bold pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-resq-blue outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-resq-blue hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center space-x-1.5 flex-shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Recent Chips */}
          {recentIncidents.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Recent Queries:
              </span>
              {recentIncidents.map((inc) => (
                <button
                  key={inc.referenceId}
                  onClick={() => {
                    setTrackInput(inc.referenceId);
                    setSearchParams({ ref: inc.referenceId });
                    performTracking(inc.referenceId);
                  }}
                  className="font-mono text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                >
                  {inc.referenceId}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-xs font-semibold text-red-800 flex items-center space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Full-Page Tracking Interface */}
        {trackedIncident ? (
          <div className="w-full animate-fadeIn">
            <CitizenLiveTracking incident={trackedIncident} />
          </div>
        ) : (
          !loading && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md mx-auto flex items-center justify-center text-resq-blue border border-slate-200">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Active Incident Loaded</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your emergency tracking number above or click on any generated tracking link from your citizen report submission to inspect live response status and unit telemetry.
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};
export default LiveIncidentTrackingPage;
