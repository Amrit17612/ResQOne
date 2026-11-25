import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import socket from '../../services/socket';
import { Truck, MapPin, CheckCircle, Navigation, Activity, Hospital, Radio, Send, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const ambulanceIcon = L.divIcon({
  className: 'amb-marker',
  html: `<div style="background:#f59e0b;color:white;font-weight:900;font-size:11px;padding:3px 7px;border-radius:8px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);white-space:nowrap;">🚑 AMB-EMS</div>`,
  iconSize: [60, 26],
  iconAnchor: [30, 26]
});

const hospitalIcon = L.divIcon({
  className: 'hosp-marker',
  html: `<div style="background:#059669;color:white;font-weight:900;font-size:11px;padding:3px 7px;border-radius:8px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);white-space:nowrap;">🏥 HOSP</div>`,
  iconSize: [54, 26],
  iconAnchor: [27, 26]
});

const incidentIcon = L.divIcon({
  className: 'inc-marker',
  html: `<div style="background:#dc2626;color:white;font-weight:900;font-size:11px;padding:3px 7px;border-radius:8px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);white-space:nowrap;">🚨 INCIDENT</div>`,
  iconSize: [64, 26],
  iconAnchor: [32, 26]
});

const STAGES = [
  { id: 'UNIT_DISPATCHED', label: 'Unit Dispatched' },
  { id: 'APPROACHING_SCENE', label: 'Approaching Scene' },
  { id: 'ARRIVED_AT_SCENE', label: 'Arrived at Scene' },
  { id: 'PATIENT_PICKED_UP', label: 'Patient Picked Up' },
  { id: 'EN_ROUTE_TO_HOSPITAL', label: 'En Route to Hospital' },
  { id: 'ARRIVED_AT_HOSPITAL', label: 'Arrived at Hospital' },
  { id: 'PATIENT_HANDOVER_COMPLETED', label: 'Handover Completed' },
  { id: 'INCIDENT_RESOLVED', label: 'Incident Resolved' }
];

export const AmbulanceDashboard = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [requestedBedType, setRequestedBedType] = useState('ICU');
  const [patientCondition, setPatientCondition] = useState('CRITICAL');
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [simulationTimer, setSimulationTimer] = useState(null);
  const [allocationStatus, setAllocationStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchAmbulanceUnits();

    socket.emit('join:room', 'dept:ambulance');

    socket.on('vehicle:location_updated', (telemetry) => {
      setUnits((prev) =>
        prev.map((u) =>
          u._id === telemetry.unitId
            ? { ...u, currentLocation: { ...u.currentLocation, coordinates: telemetry.coordinates } }
            : u
        )
      );
    });

    socket.on('allocation:updated', (data) => {
      setAllocationStatus(data.status);
      setStatusMessage(`Hospital update: Bed allocation is now ${data.status}`);
    });

    return () => {
      socket.off('vehicle:location_updated');
      socket.off('allocation:updated');
      if (simulationTimer) clearInterval(simulationTimer);
    };
  }, [simulationTimer]);

  const fetchAmbulanceUnits = async () => {
    try {
      const { data } = await api.get('/dispatch/suitable-units?incidentLat=28.5420&incidentLng=77.2210');
      if (data.success) {
        const ambOnly = data.units.filter((u) => u.departmentType === 'AMBULANCE');
        setUnits(ambOnly);
        if (ambOnly.length > 0) {
          setSelectedUnit(ambOnly[0]);
          fetchNearbyHospitals(ambOnly[0].currentLocation?.coordinates[1], ambOnly[0].currentLocation?.coordinates[0]);
        }
      }
    } catch (e) {
      console.warn('Error loading ambulance units:', e.message);
    }
  };

  const fetchNearbyHospitals = async (lat = 28.5420, lng = 77.2210) => {
    try {
      const { data } = await api.get(`/hospitals?lat=${lat}&lng=${lng}`);
      if (data.success) {
        setNearbyHospitals(data.hospitals || []);
        if (data.hospitals?.length > 0) {
          setSelectedHospital(data.hospitals[0]);
        }
      }
    } catch (e) {
      console.warn('Error loading hospitals:', e.message);
    }
  };

  // Step 1: Advance lifecycle stage
  const handleStageChange = async (newStage) => {
    if (!selectedUnit) return;
    try {
      const { data } = await api.post('/dispatch/stage-transition', {
        assignmentId: selectedUnit.activeAssignmentId,
        unitId: selectedUnit._id,
        stage: newStage,
        notes: `Advanced to ${newStage}`
      });

      if (data.success) {
        setStatusMessage(`Stage advanced to ${newStage}`);
        if (newStage === 'PATIENT_PICKED_UP') {
          // Auto trigger hospital search
          fetchNearbyHospitals(
            selectedUnit.currentLocation.coordinates[1],
            selectedUnit.currentLocation.coordinates[0]
          );
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stage');
    }
  };

  // Step 2: Request Atomic Bed Reservation
  const handleRequestBed = async () => {
    if (!selectedHospital || !selectedUnit) return;
    try {
      const { data } = await api.post('/hospitals/allocations', {
        hospitalId: selectedHospital._id,
        ambulanceId: selectedUnit._id,
        incidentId: selectedUnit.activeIncidentId,
        bedType: requestedBedType,
        patientCondition,
        vitals: { heartRate: 110, bp: '130/90', spO2: 92 }
      });

      if (data.success) {
        setAllocationStatus('REQUESTED');
        setStatusMessage(`Bed reservation request dispatched to ${selectedHospital.name}!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request bed allocation');
    }
  };

  // Step 3: Start GPS Telemetry Simulation along route
  const toggleGpsSimulation = () => {
    if (isSimulatingGps) {
      clearInterval(simulationTimer);
      setIsSimulatingGps(false);
      setStatusMessage('GPS Telemetry paused.');
      return;
    }

    if (!selectedUnit) return;
    setIsSimulatingGps(true);
    setStatusMessage('Broadcasting live simulated GPS telemetry every 2.5s...');

    let currentLat = selectedUnit.currentLocation.coordinates[1];
    let currentLng = selectedUnit.currentLocation.coordinates[0];

    const timer = setInterval(async () => {
      // Step towards destination (AIIMS Trauma Centre / Ring Road)
      currentLat += (Math.random() - 0.45) * 0.001;
      currentLng += (Math.random() - 0.45) * 0.001;

      try {
        await api.post('/dispatch/telemetry', {
          unitId: selectedUnit._id,
          assignmentId: selectedUnit.activeAssignmentId,
          incidentId: selectedUnit.activeIncidentId,
          latitude: currentLat,
          longitude: currentLng,
          heading: 65,
          speed: 48,
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
        // quiet error
      }
    }, 2500);

    setSimulationTimer(timer);
  };

  return (
    <DashboardLayout
      title="Ambulance Emergency Medical Response (EMS)"
      subtitle="Fleet Dispatch, Real-Time Telematics & Smart Hospital Bed Reservation"
    >
      <div className="space-y-6">
        {statusMessage && (
          <div className="bg-amber-950/60 border border-amber-500/50 p-3 rounded-xl text-amber-200 text-xs flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              {statusMessage}
            </span>
            <button
              onClick={() => setStatusMessage('')}
              className="text-amber-400 hover:text-white font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Fleet List & Stage Progress */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-sm text-slate-800">EMS Response Fleet</h3>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  {units.length} Units Available
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
                          ? 'bg-amber-50/80 border-amber-500 shadow-sm text-slate-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-sm text-slate-900">{u.unitIdentifier}</span>
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          {u.vehicleType}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{u.organizationName}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Paramedic: <strong>{u.assignedStaffName}</strong></span>
                        <span className="font-bold text-amber-700">{u.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Transition Stepper */}
            {selectedUnit && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-700">12-Stage EMS Lifecycle</h4>
                  <button
                    onClick={toggleGpsSimulation}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow ${
                      isSimulatingGps
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{isSimulatingGps ? 'Pause GPS Telemetry' : 'Start Live GPS Broadcast'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {STAGES.map((s) => (
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

          {/* Right Column: Interactive Map & Smart Hospital Bed Reservation */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Leaflet Map Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-72 relative">
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

                  {/* Ambulance Marker */}
                  <Marker
                    position={[
                      selectedUnit.currentLocation.coordinates[1],
                      selectedUnit.currentLocation.coordinates[0]
                    ]}
                    icon={ambulanceIcon}
                  >
                    <Popup>
                      <div className="text-xs font-sans">
                        <strong>{selectedUnit.unitIdentifier}</strong>
                        <p>{selectedUnit.organizationName}</p>
                        <p className="text-emerald-600 font-bold">Status: {selectedUnit.status}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Nearby Hospitals Markers */}
                  {nearbyHospitals.map((hosp) => (
                    <Marker
                      key={hosp._id}
                      position={[hosp.location?.coordinates[1] || 28.5672, hosp.location?.coordinates[0] || 77.2100]}
                      icon={hospitalIcon}
                    >
                      <Popup>
                        <div className="text-xs font-sans">
                          <strong>{hosp.name}</strong>
                          <p>ICU: {hosp.beds?.ICU ? hosp.beds.ICU.total - hosp.beds.ICU.occupied : 0} Available</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Module H: Smart Hospital Bed Selection & Atomic Handover */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Hospital className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-800">Smart Hospital Suitability Ranking</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Ranked by Road Distance & ICU Availability
                </span>
              </div>

              {/* Hospital Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nearbyHospitals.map((hosp) => {
                  const isSelected = selectedHospital?._id === hosp._id;
                  const icuAvailable = hosp.beds?.ICU ? hosp.beds.ICU.total - hosp.beds.ICU.occupied : 0;
                  return (
                    <div
                      key={hosp._id}
                      onClick={() => setSelectedHospital(hosp)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 text-xs">{hosp.name}</span>
                        {hosp.hasTraumaCenter && (
                          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                            TRAUMA
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{hosp.address}</p>

                      <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                        <span className="font-mono text-indigo-700 font-bold">
                          ~{hosp.travelMinutes || 8} mins ({hosp.roadDistanceKm || 3.2} km)
                        </span>
                        <span className="font-bold text-emerald-700">ICU Beds: {icuAvailable}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bed Type & Condition Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Required Bed Type
                  </label>
                  <select
                    value={requestedBedType}
                    onChange={(e) => setRequestedBedType(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="ICU">Intensive Care Unit (ICU)</option>
                    <option value="TRAUMA">Emergency Trauma Bed</option>
                    <option value="OXYGEN_SUPPORT">Oxygen / Ventilator Bed</option>
                    <option value="GENERAL">General Emergency Bed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Patient Triage Condition
                  </label>
                  <select
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="CRITICAL">Critical (Red Tag - Immediate)</option>
                    <option value="URGENT">Urgent (Yellow Tag - Serious)</option>
                    <option value="STABLE">Stable (Green Tag - Minor)</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRequestBed}
                  disabled={!selectedHospital}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Bed Reservation Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
