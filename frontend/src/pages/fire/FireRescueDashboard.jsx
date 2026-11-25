import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import socket from '../../services/socket';
import { Flame, MapPin, Radio, CheckCircle, Navigation, AlertTriangle, Shield } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const fireIcon = L.divIcon({
  className: 'fire-marker',
  html: `<div style="background:#dc2626;color:white;font-weight:900;font-size:11px;padding:3px 7px;border-radius:8px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);white-space:nowrap;">🚒 FIRE TENDER</div>`,
  iconSize: [84, 26],
  iconAnchor: [42, 26]
});

const incidentIcon = L.divIcon({
  className: 'inc-marker',
  html: `<div style="background:#ea580c;color:white;font-weight:900;font-size:11px;padding:3px 7px;border-radius:8px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);white-space:nowrap;">🔥 FIRE CALL</div>`,
  iconSize: [70, 26],
  iconAnchor: [35, 26]
});

const FIRE_STAGES = [
  { id: 'UNIT_DISPATCHED', label: 'Tenders Dispatched' },
  { id: 'EN_ROUTE', label: 'En Route with Sirens' },
  { id: 'ARRIVED_AT_SCENE', label: 'Arrived at Hazard Site' },
  { id: 'WATER_HYDRANT_CONNECTED', label: 'Water Lines Connected' },
  { id: 'FIRE_CONTAINED', label: 'Fire Suppressed / Contained' },
  { id: 'OPERATION_COMPLETED', label: 'Cooling & Operation Complete' }
];

export const FireRescueDashboard = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [assignedIncidents, setAssignedIncidents] = useState([]);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [simulationTimer, setSimulationTimer] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchFireUnits();
    fetchAssignedIncidents();

    socket.emit('join:room', 'dept:fire_rescue');

    socket.on('vehicle:location_updated', (telemetry) => {
      setUnits((prev) =>
        prev.map((u) =>
          u._id === telemetry.unitId
            ? { ...u, currentLocation: { ...u.currentLocation, coordinates: telemetry.coordinates } }
            : u
        )
      );
    });

    return () => {
      socket.off('vehicle:location_updated');
      if (simulationTimer) clearInterval(simulationTimer);
    };
  }, [simulationTimer]);

  const fetchFireUnits = async () => {
    try {
      const { data } = await api.get('/dispatch/suitable-units?incidentLat=28.5200&incidentLng=77.2750');
      if (data.success) {
        const fireOnly = data.units.filter((u) => u.departmentType === 'FIRE_RESCUE');
        setUnits(fireOnly);
        if (fireOnly.length > 0) setSelectedUnit(fireOnly[0]);
      }
    } catch (e) {
      console.warn('Fire units fetch:', e.message);
    }
  };

  const fetchAssignedIncidents = async () => {
    try {
      const { data } = await api.get('/incidents?department=FIRE_RESCUE');
      if (data.success) {
        setAssignedIncidents(data.incidents || []);
      }
    } catch (e) {
      console.warn('Incidents fetch:', e.message);
    }
  };

  const handleStageChange = async (stage) => {
    if (!selectedUnit) return;
    try {
      await api.post('/dispatch/stage-transition', {
        assignmentId: selectedUnit.activeAssignmentId,
        unitId: selectedUnit._id,
        stage,
        notes: `Fire rescue status updated to ${stage}`
      });
      setStatusMessage(`Fire command status: ${stage.replace(/_/g, ' ')}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update fire stage');
    }
  };

  const toggleGpsSimulation = () => {
    if (isSimulatingGps) {
      clearInterval(simulationTimer);
      setIsSimulatingGps(false);
      setStatusMessage('Fire engine GPS simulation paused.');
      return;
    }

    if (!selectedUnit) return;
    setIsSimulatingGps(true);
    setStatusMessage('Fire tender GPS streaming to central command...');

    let currentLat = selectedUnit.currentLocation.coordinates[1];
    let currentLng = selectedUnit.currentLocation.coordinates[0];

    const timer = setInterval(async () => {
      currentLat += (Math.random() - 0.45) * 0.001;
      currentLng += (Math.random() - 0.45) * 0.001;

      try {
        await api.post('/dispatch/telemetry', {
          unitId: selectedUnit._id,
          assignmentId: selectedUnit.activeAssignmentId,
          incidentId: selectedUnit.activeIncidentId,
          latitude: currentLat,
          longitude: currentLng,
          heading: 135,
          speed: 40,
          accuracy: 5,
          isSimulatedGps: true
        });

        setSelectedUnit((prev) => ({
          ...prev,
          currentLocation: {
            ...prev.currentLocation,
            coordinates: [currentLng, currentLat]
          }
        }));
      } catch (e) {
        // silent
      }
    }, 2500);

    setSimulationTimer(timer);
  };

  return (
    <DashboardLayout
      title="Fire & Tactical Rescue Command"
      subtitle="Fire Station Tenders, Foam Suppression Deployments & Industrial Hazard Control"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Fire Tenders List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-sm text-slate-800">Fire Engines & Foam Tenders</h3>
                <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                  {units.length} In Fleet
                </span>
              </div>

              <div className="space-y-2">
                {units.map((u) => {
                  const isSelected = selectedUnit?._id === u._id;
                  return (
                    <div
                      key={u._id}
                      onClick={() => setSelectedUnit(u)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                        isSelected
                          ? 'bg-red-50/80 border-red-500 shadow-sm text-slate-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-sm text-slate-900">{u.unitIdentifier}</span>
                        <span className="bg-red-100 text-red-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          {u.vehicleType}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{u.organizationName}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Commander: <strong>{u.assignedStaffName}</strong></span>
                        <span className="font-bold text-red-700">{u.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fire Action Stages */}
            {selectedUnit && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-700">Suppression Stages</h4>
                  <button
                    onClick={toggleGpsSimulation}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow ${
                      isSimulatingGps
                        ? 'bg-red-700 hover:bg-red-800 text-white animate-pulse'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{isSimulatingGps ? 'Pause GPS Stream' : 'Transmit Live GPS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {FIRE_STAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStageChange(s.id)}
                      className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map Preview & Assigned Fire Calls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-80 relative">
              {selectedUnit?.currentLocation?.coordinates && (
                <MapContainer
                  center={[
                    selectedUnit.currentLocation.coordinates[1],
                    selectedUnit.currentLocation.coordinates[0]
                  ]}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Fire Unit Marker */}
                  <Marker
                    position={[
                      selectedUnit.currentLocation.coordinates[1],
                      selectedUnit.currentLocation.coordinates[0]
                    ]}
                    icon={fireIcon}
                  >
                    <Popup>
                      <div className="text-xs font-sans">
                        <strong>{selectedUnit.unitIdentifier}</strong>
                        <p>{selectedUnit.organizationName}</p>
                        <p className="text-red-600 font-bold">Status: {selectedUnit.status}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Incident Markers */}
                  {assignedIncidents.map((inc) => (
                    <Marker
                      key={inc._id}
                      position={[inc.location?.coordinates[1] || 28.5200, inc.location?.coordinates[0] || 77.2750]}
                      icon={incidentIcon}
                    >
                      <Popup>
                        <div className="text-xs font-sans">
                          <strong>{inc.referenceId}</strong>
                          <p>{inc.title}</p>
                          <p className="text-red-600 font-bold">Priority: {inc.priority}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Fire Log of Assigned Calls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Fire & HAZMAT Calls Under Command</h3>
              {assignedIncidents.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No active fire emergencies assigned currently.</p>
              ) : (
                <div className="space-y-2">
                  {assignedIncidents.map((inc) => (
                    <div key={inc._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-red-700">{inc.referenceId}</span>
                        <h5 className="font-bold text-slate-800">{inc.title}</h5>
                        <p className="text-slate-500 text-[11px]">{inc.location?.address}</p>
                      </div>
                      <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {inc.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
