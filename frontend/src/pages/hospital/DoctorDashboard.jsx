import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  HeartPulse,
  Activity,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  UserCheck
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [incomingPatients, setIncomingPatients] = useState([]);
  const [readinessStatus, setReadinessStatus] = useState('READY_TRAUMA_BAY_1');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchIncomingAllocations();

    socket.emit('join:room', 'dept:hospital');

    socket.on('hospital:allocation_requested', (alloc) => {
      setIncomingPatients((prev) => [alloc, ...prev]);
      setActionMessage('New Incoming Critical Patient Inbound via ALS Ambulance!');
    });

    return () => {
      socket.off('hospital:allocation_requested');
    };
  }, []);

  const fetchIncomingAllocations = async () => {
    try {
      const { data } = await api.get('/hospitals/allocations/requests');
      if (data.success) {
        setIncomingPatients(data.allocations || []);
      }
    } catch (e) {
      console.warn('Allocations fetch note:', e.message);
    }
  };

  const handleAcknowledge = (id) => {
    setActionMessage('Inbound patient acknowledged. Trauma team assembled at triage station.');
  };

  return (
    <DashboardLayout
      title="Physician & Doctor Clinical Terminal"
      subtitle="Inbound Ambulance Triage, Bed Allocation Readiness & Trauma Handover Confirmation"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inbound Patients Stream */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-800">Inbound Emergency Patients & Triage Board</h3>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full">
                  {incomingPatients.length} Patients En Route
                </span>
              </div>

              {incomingPatients.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No critical patients currently en route to your trauma unit.
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingPatients.map((patient, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {patient.incidentId?.referenceId || `INC-20261104-00${idx + 1}`}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">
                            Condition: {patient.patientCondition || 'CRITICAL'}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          Required Bed: <strong>{patient.requestedBedType || 'ICU / Trauma Bed'}</strong>
                        </p>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Vitals: HR {patient.vitals?.heartRate || 108} bpm · SpO2 {patient.vitals?.spO2 || 94}% · BP {patient.vitals?.bp || '125/85'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAcknowledge(patient._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Acknowledge Patient & Prep Bay</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Doctor Readiness & Trauma Bay Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-700">Trauma Bay Readiness Status</h4>
              <div className="space-y-2">
                {[
                  { id: 'READY_TRAUMA_BAY_1', label: 'Trauma Bay 1 (Ventilator Ready)' },
                  { id: 'READY_ICU_UNIT', label: 'ICU Bed 4 Reserved' },
                  { id: 'BUSY_SURGERY', label: 'Attending Minor Operation' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setReadinessStatus(s.id);
                      setActionMessage(`Doctor readiness updated: ${s.label}`);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                      readinessStatus === s.id
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{s.label}</span>
                    {readinessStatus === s.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-700">Clinical Handover Updates</h4>
              <textarea
                rows="4"
                placeholder="Record clinical admission findings, initial medication, oxygen saturation upon arrival..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              ></textarea>
              <button
                onClick={() => {
                  setActionMessage('Clinical notes logged into hospital admission record.');
                  setClinicalNotes('');
                }}
                disabled={!clinicalNotes.trim()}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
              >
                Log Clinical Admission Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

