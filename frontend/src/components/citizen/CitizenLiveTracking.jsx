import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../../services/socket';
import {
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  Truck,
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

// Custom icons
const citizenIncidentIcon = L.divIcon({
  className: 'inc-user-marker',
  html: `<div style="background:#dc2626;color:white;font-weight:900;font-size:10px;padding:3px 6px;border-radius:6px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);">🚨 EMERGENCY SITE</div>`,
  iconSize: [110, 24],
  iconAnchor: [55, 24]
});

const vehicleMarkerIcon = (dept) => {
  let color = '#2563eb';
  let label = '🚑 AMBULANCE';
  if (dept === 'POLICE') {
    color = '#4338ca';
    label = '🚓 POLICE';
  } else if (dept === 'FIRE_RESCUE') {
    color = '#dc2626';
    label = '🚒 FIRE TENDER';
  }

  return L.divIcon({
    className: 'veh-user-marker',
    html: `<div style="background:${color};color:white;font-weight:900;font-size:10px;padding:3px 6px;border-radius:6px;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);white-space:nowrap;">${label}</div>`,
    iconSize: [100, 24],
    iconAnchor: [50, 24]
  });
};

const TIMELINE_STEPS = [
  { key: 'REPORT_SUBMITTED', title: 'Report Submitted', desc: 'Emergency received by Central Admin' },
  { key: 'UNIT_DISPATCHED', title: 'Unit Dispatched', desc: 'Emergency vehicle en route with sirens' },
  { key: 'UNIT_ARRIVED', title: 'Unit Arrived on Scene', desc: 'Responders conducting on-ground operations' },
  { key: 'PATIENT_PICKED_UP', title: 'Patient / Casualty Secured', desc: 'Triage complete; en route to medical facility' },
  { key: 'PATIENT_HANDOVER_COMPLETED', title: 'Handover Completed', desc: 'Patient safely admitted to hospital' },
  { key: 'INCIDENT_RESOLVED', title: 'Operation Resolved', desc: 'Situation fully neutralized and closed' }
];

export default function CitizenLiveTracking({ incident }) {
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!incident?._id) return;

    // Join room for real-time tracking
    socket.emit('join:room', `incident:${incident._id}`);

    socket.on('vehicle:location_updated', (telemetry) => {
      setVehicleLocation([telemetry.latitude, telemetry.longitude]);
      setActiveUnit((prev) => ({
        ...prev,
        unitIdentifier: telemetry.unitIdentifier || prev?.unitIdentifier || 'Dispatched Unit',
        status: telemetry.status,
        speed: telemetry.speed,
        heading: telemetry.heading
      }));
      setLastUpdated(new Date());
    });

    return () => {
      socket.off('vehicle:location_updated');
    };
  }, [incident?._id]);

  if (!incident) return null;

  const incidentCoords = incident.location?.coordinates
    ? [incident.location.coordinates[1], incident.location.coordinates[0]]
    : [28.5420, 77.2210];

  const mapCenter = vehicleLocation || incidentCoords;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded border border-red-200">
              {incident.referenceId}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">{incident.category}</span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-1">{incident.title}</h3>
          <p className="text-xs text-slate-500">📍 {incident.location?.address}</p>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            {incident.status}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">
            Last GPS sync: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Live Map with Route Polyline */}
      <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Incident Pin */}
          <Marker position={incidentCoords} icon={citizenIncidentIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Emergency Site</strong>
                <p>{incident.location?.address}</p>
              </div>
            </Popup>
          </Marker>

          {/* Dispatched Vehicle Marker */}
          {vehicleLocation && (
            <Marker position={vehicleLocation} icon={vehicleMarkerIcon(activeUnit?.departmentType || 'AMBULANCE')}>
              <Popup>
                <div className="text-xs">
                  <strong>{activeUnit?.unitIdentifier || 'Field Emergency Unit'}</strong>
                  <p>Status: {activeUnit?.status || 'En Route'}</p>
                  <p>Speed: {activeUnit?.speed || 45} km/h</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Polyline connecting vehicle to incident */}
          {vehicleLocation && (
            <Polyline
              positions={[vehicleLocation, incidentCoords]}
              color="#2563eb"
              weight={4}
              dashArray="6, 8"
            />
          )}
        </MapContainer>
      </div>

      {/* 6-Stage Timeline Stepper */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Real-Time Response Timeline
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted =
              idx === 0 ||
              (incident.status === 'VERIFIED' && idx <= 1) ||
              (incident.status === 'IN_PROGRESS' && idx <= 3) ||
              (incident.status === 'RESOLVED' && idx <= 5);

            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border transition ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-400 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2
                    className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                  <span className="font-bold text-xs">{step.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

