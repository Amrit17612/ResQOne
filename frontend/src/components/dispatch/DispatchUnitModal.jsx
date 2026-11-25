import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Truck, ShieldCheck, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DispatchUnitModal({ incident, onClose, onUnitDispatched }) {
  const [suitableUnits, setSuitableUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [dispatchRoleNotes, setDispatchRoleNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!incident) return;
    fetchSuitableUnits();
  }, [incident]);

  const fetchSuitableUnits = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const lat = incident.location?.coordinates?.[1] || 28.5420;
      const lng = incident.location?.coordinates?.[0] || 77.2210;

      const { data } = await api.get(`/dispatch/suitable-units?incidentLat=${lat}&incidentLng=${lng}`);
      if (data.success) {
        setSuitableUnits(data.units || []);
        if (data.units?.length > 0) {
          setSelectedUnit(data.units[0]);
        }
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to fetch suitable emergency units.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!selectedUnit) return;
    setDispatching(true);
    setErrorMessage('');
    try {
      const { data } = await api.post('/dispatch/assign-unit', {
        incidentId: incident._id,
        unitId: selectedUnit._id,
        notes: dispatchRoleNotes || `Dispatched to incident ${incident.referenceId} at ${incident.location?.address}`
      });

      if (data.success) {
        if (onUnitDispatched) onUnitDispatched(data.incident, selectedUnit);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch unit.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-mono text-cyan-400 text-xs font-bold uppercase tracking-wider block">
              Multi-Department Dispatch Center
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Assign Response Unit for {incident?.referenceId}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incident Summary Mini-Strip */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px]">INCIDENT HEADLINE:</span>
            <span className="font-bold text-white text-xs">{incident?.title}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-semibold block text-[10px]">CATEGORY & PRIORITY:</span>
            <span className="font-bold text-amber-400">{incident?.category} · {incident?.priority}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Modal Body: Available Fleet Units List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Ranked Suitable Units (Proximity & Availability)
            </span>
            <span className="text-slate-500 text-[11px]">{suitableUnits.length} Units Available</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Calculating road distances and unit availability...
            </div>
          ) : suitableUnits.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl p-4 border border-slate-800">
              No available response units found within regional reach. Units may already be assigned or offline.
            </div>
          ) : (
            <div className="space-y-2">
              {suitableUnits.map((unit) => {
                const isSelected = selectedUnit?._id === unit._id;
                return (
                  <div
                    key={unit._id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg text-white'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                          unit.departmentType === 'POLICE'
                            ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                            : unit.departmentType === 'AMBULANCE'
                            ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                            : unit.departmentType === 'FIRE_RESCUE'
                            ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                            : 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white">{unit.unitIdentifier}</span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                            {unit.vehicleType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {unit.organizationName} · Staff: {unit.assignedStaffName || 'Officer on duty'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{unit.estimatedMinutes || 6} mins</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {(unit.distanceKm || 2.4).toFixed(1)} km away
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dispatcher Notes */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Dispatch Instructions / Field Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Approach from North gate. Traffic congestion on Outer Ring Road."
              value={dispatchRoleNotes}
              onChange={(e) => setDispatchRoleNotes(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDispatch}
            disabled={!selectedUnit || dispatching}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {dispatching ? (
              'Dispatching Unit...'
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Unit Dispatch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

