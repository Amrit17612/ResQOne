import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import socket from '../../services/socket';
import {
  ShieldAlert,
  AlertTriangle,
  Bot,
  CheckCircle,
  XCircle,
  Truck,
  Activity,
  ArrowRight,
  Send,
  Users,
  MapPin,
  Map as MapIcon
} from 'lucide-react';
import CentralOperationsMap from '../../components/maps/CentralOperationsMap';
import DispatchUnitModal from '../../components/dispatch/DispatchUnitModal';

const DEPARTMENTS = [
  { id: 'POLICE', label: 'Police', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'FIRE_RESCUE', label: 'Fire & Rescue', color: 'bg-red-100 text-red-800' },
  { id: 'AMBULANCE', label: 'Ambulance EMS', color: 'bg-amber-100 text-amber-800' },
  { id: 'DISASTER_MANAGEMENT', label: 'Disaster Hub', color: 'bg-purple-100 text-purple-800' }
];

export const CentralAdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OPERATIONS_MAP'); // 'OPERATIONS_MAP' | 'TRIAGE_FEED'
  const [dispatchModalIncident, setDispatchModalIncident] = useState(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closureSummary, setClosureSummary] = useState('');
  const [isOverride, setIsOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [closureLoading, setClosureLoading] = useState(false);
  const [closureError, setClosureError] = useState('');

  useEffect(() => {
    fetchIncidents();
    fetchFleetUnits();

    socket.emit('join:room', 'dept:central_admin');

    socket.on('incident:new', (newInc) => {
      setIncidents((prev) => [newInc, ...prev]);
    });

    socket.on('incident:updated', (updated) => {
      setIncidents((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      if (selectedIncident?._id === updated._id) {
        setSelectedIncident(updated);
      }
    });

    socket.on('vehicle:location_updated', (telemetry) => {
      setUnits((prevUnits) =>
        prevUnits.map((u) =>
          u._id === telemetry.unitId
            ? {
                ...u,
                currentLocation: {
                  ...u.currentLocation,
                  coordinates: telemetry.coordinates
                },
                status: telemetry.status || u.status
              }
            : u
        )
      );
    });

    return () => {
      socket.off('incident:new');
      socket.off('incident:updated');
      socket.off('vehicle:location_updated');
    };
  }, [selectedIncident]);

  const fetchIncidents = async () => {
    try {
      const { data } = await api.get('/incidents');
      if (data.success) {
        setIncidents(data.incidents);
        if (data.incidents.length > 0 && !selectedIncident) {
          selectIncident(data.incidents[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFleetUnits = async () => {
    try {
      const { data } = await api.get('/dispatch/suitable-units?incidentLat=28.5420&incidentLng=77.2210');
      if (data.success) {
        setUnits(data.units || []);
      }
    } catch (e) {
      console.warn('Fleet fetch note:', e.message);
    }
  };

  const selectIncident = (inc) => {
    setSelectedIncident(inc);
    setSelectedDepts(inc.assignedDepartments || inc.aiAdvisory?.suggestedDepartments || []);
  };

  const toggleDept = (deptId) => {
    if (selectedDepts.includes(deptId)) {
      setSelectedDepts(selectedDepts.filter((d) => d !== deptId));
    } else {
      setSelectedDepts([...selectedDepts, deptId]);
    }
  };

  const handleVerify = async (status) => {
    if (!selectedIncident) return;
    try {
      const payload = {
        status,
        departments: selectedDepts,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
      };
      const { data } = await api.patch(`/incidents/${selectedIncident._id}/verify`, payload);
      if (data.success) {
        setSelectedIncident(data.incident);
        setIncidents(incidents.map((i) => (i._id === data.incident._id ? data.incident : i)));
        alert(`Incident successfully marked as ${status} and routed.`);
      }
    } catch (e) {
      alert('Error updating incident status');
    }
  };

  const handleCloseIncident = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setClosureLoading(true);
    setClosureError('');
    try {
      const payload = {
        closureSummary: closureSummary.trim(),
        isOverride,
        overrideReason: isOverride ? overrideReason.trim() : undefined
      };
      const { data } = await api.post(`/incidents/${selectedIncident._id}/close`, payload);
      if (data.success) {
        setSelectedIncident(data.incident);
        setIncidents(incidents.map((i) => (i._id === data.incident._id ? data.incident : i)));
        setCloseModalOpen(false);
        setClosureSummary('');
        setIsOverride(false);
        setOverrideReason('');
        alert(`Incident ${data.incident.referenceId} officially CLOSED. Debrief logged.`);
      }
    } catch (err) {
      setClosureError(err.response?.data?.message || 'Failed to close incident.');
    } finally {
      setClosureLoading(false);
    }
  };

  const handleUnitDispatched = (updatedIncident) => {
    setIncidents((prev) =>
      prev.map((i) => (i._id === updatedIncident._id ? updatedIncident : i))
    );
    if (selectedIncident?._id === updatedIncident._id) {
      setSelectedIncident(updatedIncident);
    }
    fetchFleetUnits();
  };

  return (
    <DashboardLayout
      title="Central Operations Command"
      subtitle="Real-Time Emergency Triaging, Multi-Department Dispatch & Spatial Monitoring"
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Active Incidents</span>
              <p className="text-2xl font-black text-slate-800">{incidents.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-resq-crimson flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Critical Incidents</span>
              <p className="text-2xl font-black text-amber-600">
                {incidents.filter((i) => i.priority === 'CRITICAL').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Fleet Units Deployed</span>
              <p className="text-2xl font-black text-resq-blue">{units.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-resq-blue flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Verified & Dispatched</span>
              <p className="text-2xl font-black text-emerald-600">
                {incidents.filter((i) => i.status === 'VERIFIED' || i.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation: Map vs Triage Feed */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('OPERATIONS_MAP')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'OPERATIONS_MAP'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Live Emergency Operations Map</span>
          </button>
          <button
            onClick={() => setActiveTab('TRIAGE_FEED')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'TRIAGE_FEED'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>AI Incident Triage & Verification</span>
          </button>
        </div>

        {/* TAB 1: LIVE EMERGENCY OPERATIONS MAP (MODULE C) */}
        {activeTab === 'OPERATIONS_MAP' && (
          <div>
            <CentralOperationsMap
              incidents={incidents}
              units={units}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => {
                selectIncident(inc);
              }}
              onOpenDispatchModal={(inc) => {
                setDispatchModalIncident(inc);
              }}
            />
          </div>
        )}

        {/* TAB 2: MASTER TRIAGE GRID */}
        {activeTab === 'TRIAGE_FEED' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Incident Ingestion Feed */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <h3 className="font-bold text-sm text-slate-800">Incident Feed</h3>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {incidents.length} Records
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {incidents.map((inc) => (
                  <div
                    key={inc._id}
                    onClick={() => selectIncident(inc)}
                    className={`p-4 cursor-pointer transition text-xs ${
                      selectedIncident?._id === inc._id ? 'bg-blue-50/70 border-l-4 border-resq-blue' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-slate-700">{inc.referenceId}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          inc.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : inc.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{inc.title}</h4>
                    <p className="text-slate-500 line-clamp-2 mb-2">{inc.description}</p>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>{inc.category}</span>
                      <span
                        className={`font-semibold ${
                          inc.status === 'PENDING_VERIFICATION' ? 'text-amber-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Detail & AI Advisory Triage Decision Room */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
              {selectedIncident ? (
                <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-500 block">
                        REF: {selectedIncident.referenceId}
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1">{selectedIncident.title}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {selectedIncident.location?.address} (
                        {selectedIncident.location?.coordinates?.[1]?.toFixed(4)},{' '}
                        {selectedIncident.location?.coordinates?.[0]?.toFixed(4)})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {selectedIncident.status}
                      </span>
                    </div>
                  </div>

                  {/* AI Advisory Panel */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-resq-blue mb-2">
                      <Bot className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs font-black uppercase tracking-wider">AI Advisory Decision Engine</span>
                      <span className="ml-auto text-[11px] bg-blue-200/60 text-blue-900 font-bold px-2 py-0.5 rounded">
                        Confidence: {((selectedIncident.aiAdvisory?.confidenceScore || 0.85) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {selectedIncident.aiAdvisory?.summary || 'AI recommends high priority alert and multi-agency response.'}
                    </p>
                  </div>

                  {/* Full Description & Reporter Data */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-500">Citizen Incident Report</h4>
                    <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {selectedIncident.description}
                    </p>
                    <div className="text-xs text-slate-500 flex space-x-6 pt-1">
                      <span>
                        <strong className="text-slate-700">Reporter:</strong> {selectedIncident.reporterName}
                      </span>
                      <span>
                        <strong className="text-slate-700">Phone:</strong> {selectedIncident.reporterPhone}
                      </span>
                    </div>
                  </div>

                  {/* Active Units Assigned */}
                  {selectedIncident.activeUnits?.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-700 uppercase text-[11px] block mb-2">
                        Currently Dispatched Field Units:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedIncident.activeUnits.map((u, i) => (
                          <span
                            key={i}
                            className="bg-indigo-100 text-indigo-800 font-mono font-bold px-2.5 py-1 rounded-md text-xs border border-indigo-200"
                          >
                            {u.unitIdentifier} ({u.departmentType}) — {u.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Department Routing Selector */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-500">
                      Assign Emergency Departments (Multiple Allowed)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DEPARTMENTS.map((dept) => {
                        const isSelected = selectedDepts.includes(dept.id);
                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => toggleDept(dept.id)}
                            className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-resq-navy text-white border-resq-navy shadow-md'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>{dept.label}</span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dispatch Verification Actions */}
                  <div className="pt-4 border-t border-slate-200 mt-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => handleVerify('VERIFIED')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition text-xs flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify & Alert Agencies</span>
                    </button>

                    <button
                      onClick={() => setDispatchModalIncident(selectedIncident)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Dispatch Unit</span>
                    </button>

                    {selectedIncident.status !== 'CLOSED' ? (
                      <button
                        onClick={() => {
                          setCloseModalOpen(true);
                          setClosureError('');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition text-xs flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Close Incident</span>
                      </button>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-300 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Incident Officially Closed</span>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        const reason = prompt('Please enter reason for rejecting this report:');
                        if (reason) {
                          setRejectionReason(reason);
                          handleVerify('REJECTED');
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-3 px-4 rounded-xl transition text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                  Select an incident from the feed to review details
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multi-Department Dispatch Unit Modal */}
        {dispatchModalIncident && (
          <DispatchUnitModal
            incident={dispatchModalIncident}
            onClose={() => setDispatchModalIncident(null)}
            onUnitDispatched={handleUnitDispatched}
          />
        )}

        {/* Authorized Final Incident Closure Modal */}
        {closeModalOpen && selectedIncident && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-900 mb-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold">Authorized Final Incident Closure</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Execute formal incident closure for <strong>{selectedIncident.referenceId}</strong> ({selectedIncident.title}).
              </p>

              {closureError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{closureError}</span>
                </div>
              )}

              <form onSubmit={handleCloseIncident} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Operational Closure Summary & Debrief Notes (Required)
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={closureSummary}
                    onChange={(e) => setClosureSummary(e.target.value)}
                    placeholder="e.g. Fire extinguished, 4 casualties transported to hospital, area secured and handed over to local station."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  ></textarea>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOverride}
                      onChange={(e) => setIsOverride(e.target.checked)}
                      className="rounded text-slate-900 focus:ring-0"
                    />
                    <span>Authorized Administrative Override</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Check only if non-critical or legacy support requests remain open but operational response on scene is completed.
                  </p>

                  {isOverride && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Override Justification Reason
                      </label>
                      <input
                        type="text"
                        required
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g. Site evacuated and stabilized; secondary relief tasks transferred to district collector."
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCloseModalOpen(false);
                      setClosureError('');
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={closureLoading || !closureSummary.trim()}
                    className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow transition disabled:opacity-50 flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{closureLoading ? 'Closing...' : 'Confirm Official Incident Closure'}</span>
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
