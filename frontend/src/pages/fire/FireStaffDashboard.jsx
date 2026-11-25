import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import {
  Flame,
  Radio,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Send,
  Building,
  Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const fireIcon = L.divIcon({
  className: 'fire-staff-icon',
  html: `<div style="background:#dc2626;color:white;font-weight:900;font-size:10px;padding:3px 6px;border-radius:6px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);">🚒 FIRE TENDER</div>`,
  iconSize: [110, 24],
  iconAnchor: [55, 24]
});

const incidentIcon = L.divIcon({
  className: 'fire-inc-icon',
  html: `<div style="background:#ea580c;color:white;font-weight:900;font-size:10px;padding:3px 6px;border-radius:6px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);">🔥 HAZARD CALL</div>`,
  iconSize: [100, 24],
  iconAnchor: [50, 24]
});

const FIRE_STAGES = [
  { id: 'UNIT_DISPATCHED', label: '1. En Route with Sirens' },
  { id: 'ARRIVED_AT_SCENE', label: '2. Arrived at Fire Site' },
  { id: 'WATER_HYDRANT_CONNECTED', label: '3. Foam & Water Lines Active' },
  { id: 'FIRE_CONTAINED', label: '4. Fire Suppressed' },
  { id: 'OPERATION_COMPLETED', label: '5. Operation Completed' }
];

export const FireStaffDashboard = () => {
  const { user } = useAuth();
  const [assignedIncident, setAssignedIncident] = useState(null);
  const [assignedUnit, setAssignedUnit] = useState(null);
  const [currentStage, setCurrentStage] = useState('UNIT_DISPATCHED');
  const [isGpsStreaming, setIsGpsStreaming] = useState(false);
  const [gpsCoords, setGpsCoords] = useState([28.5280, 77.2690]);
  const [timer, setTimer] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loadingUnit, setLoadingUnit] = useState(true);

  useEffect(() => {
    fetchActiveAssignment();
    fetchMyUnit();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const fetchMyUnit = async () => {
    try {
      const { data } = await api.get('/dispatch/my-unit');
      if (data.success && data.unit) {
        setAssignedUnit(data.unit);
        if (data.unit.currentLocation?.coordinates) {
          setGpsCoords([data.unit.currentLocation.coordinates[1], data.unit.currentLocation.coordinates[0]]);
        }
      } else {
        setAssignedUnit(null);
      }
    } catch (e) {
      console.warn('Unit profile fetch note:', e.message);
      setAssignedUnit(null);
    } finally {
      setLoadingUnit(false);
    }
  };

  const fetchActiveAssignment = async () => {
    try {
      const { data } = await api.get('/incidents?department=FIRE_RESCUE');
      if (data.success && data.incidents?.length > 0) {
        setAssignedIncident(data.incidents[0]);
      }
    } catch (e) {
      console.warn('Assignment fetch note:', e.message);
    }
  };

  const handleStageUpdate = async (stage) => {
    const activeUnitId = user?.unitId || assignedUnit?._id;
    if (!activeUnitId) {
      setStatusMessage('Action Blocked: No fire unit assigned to your firefighter account.');
      return;
    }

    setCurrentStage(stage);
    setStatusMessage(`Fire command status: ${stage.replace(/_/g, ' ')}`);

    try {
      await api.post('/dispatch/stage-transition', {
        unitId: activeUnitId,
        stage,
        note: `Firefighter updated status: ${stage}`
      });
    } catch (e) {}
  };

  const toggleGpsBroadcast = () => {
    const activeUnitId = user?.unitId || assignedUnit?._id;
    if (!activeUnitId) {
      setStatusMessage('Telemetry Blocked: No fire apparatus assigned to your profile.');
      return;
    }

    if (isGpsStreaming) {
      clearInterval(timer);
      setIsGpsStreaming(false);
      setStatusMessage('Fire GPS simulation paused.');
      return;
    }

    setIsGpsStreaming(true);
    setStatusMessage('Live Fire Engine GPS telemetry streaming to Command Center...');

    let lat = gpsCoords[0];
    let lng = gpsCoords[1];

    const t = setInterval(async () => {
      lat += (Math.random() - 0.45) * 0.001;
      lng += (Math.random() - 0.45) * 0.001;
      setGpsCoords([lat, lng]);

      try {
        await api.post('/dispatch/telemetry', {
          unitId: activeUnitId,
          incidentId: assignedIncident?._id,
          latitude: lat,
          longitude: lng,
          speed: 40,
          heading: 135,
          accuracy: 5,
          isSimulatedGps: true
        });
      } catch (e) {}
    }, 2500);

    setTimer(t);
  };

  return (
    <DashboardLayout
      title="Firefighter & Rescue Staff Terminal"
      subtitle="Hydraulic Equipment Deployment, Water Tender Telematics & Fire Suppression Status"
    >
      <div className="space-y-6">
        {statusMessage && (
          <div className="bg-red-950/60 border border-red-500/50 p-3 rounded-xl text-red-200 text-xs flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
              {statusMessage}
            </span>
            <button onClick={() => setStatusMessage('')} className="text-red-400 hover:text-white font-bold">
              Dismiss
            </button>
          </div>
        )}

        {!loadingUnit && !user?.unitId && !assignedUnit && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Fire Apparatus Assignment Pending</p>
              <p className="text-xs text-amber-700">You are logged in as an active firefighter, but your command station has not yet assigned a fire engine or rescue tender to your profile. Tactical status and vehicle GPS remain offline until assigned.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Call */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-500">Fire Emergency Assignment</span>
                <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  TENDER 09
                </span>
              </div>

              {assignedIncident ? (
                <div className="space-y-2 text-xs">
                  <span className="font-mono font-bold text-red-700 block">{assignedIncident.referenceId}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{assignedIncident.title}</h3>
                  <p className="text-slate-500">📍 {assignedIncident.location?.address}</p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                    <p><strong>HAZMAT Info:</strong> Structural fire, electrical isolation required.</p>
                    <p><strong>Instructions:</strong> Deploy foam bowser, establish water feed from nearest municipal hydrant.</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-xs py-4">No active fire emergencies assigned currently.</div>
              )}
            </div>

            {/* Tactical Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase text-slate-700">Suppression Stages</h4>
                <button
                  onClick={toggleGpsBroadcast}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer ${
                    isGpsStreaming ? 'bg-red-700 text-white animate-pulse' : 'bg-red-600 text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isGpsStreaming ? 'Pause GPS Telemetry' : 'Transmit Live GPS'}</span>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {FIRE_STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStageUpdate(s.id)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                      currentStage === s.id
                        ? 'bg-red-600 text-white border-red-700 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{s.label}</span>
                    {currentStage === s.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl h-[560px] relative">
            <MapContainer center={gpsCoords} zoom={13} scrollWheelZoom={true} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={gpsCoords} icon={fireIcon}>
                <Popup>
                  <div className="text-xs">
                    <strong>My Fire Tender Position</strong>
                    <p>Status: {currentStage.replace(/_/g, ' ')}</p>
                  </div>
                </Popup>
              </Marker>

              {assignedIncident?.location?.coordinates && (
                <Marker
                  position={[assignedIncident.location.coordinates[1], assignedIncident.location.coordinates[0]]}
                  icon={incidentIcon}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>Fire Site</strong>
                      <p>{assignedIncident.location.address}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

