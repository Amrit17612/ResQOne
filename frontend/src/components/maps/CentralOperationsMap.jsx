import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Flame, Activity, AlertTriangle, Building, Navigation, Clock, CheckCircle } from 'lucide-react';

// Marker category color icons generator
const createCategoryIcon = (category, priority) => {
  let bgColor = '#ef4444'; // Red default
  if (category === 'FIRE') bgColor = '#f97316'; // Orange
  else if (category === 'MEDICAL_EMERGENCY') bgColor = '#06b6d4'; // Cyan
  else if (category === 'CRIME') bgColor = '#6366f1'; // Indigo
  else if (category === 'BUILDING_COLLAPSE') bgColor = '#eab308'; // Amber

  const pulse = priority === 'CRITICAL' ? 'animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;' : '';

  return L.divIcon({
    className: 'custom-emergency-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${bgColor}; opacity: 0.35; ${pulse}"></div>
        <div style="position: absolute; top: 4px; left: 4px; width: 24px; height: 24px; border-radius: 50%; background: ${bgColor}; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
          !
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const createUnitIcon = (dept) => {
  let color = '#2563eb';
  let label = 'AMB';
  if (dept === 'POLICE') {
    color = '#4f46e5';
    label = 'POL';
  } else if (dept === 'FIRE_RESCUE') {
    color = '#dc2626';
    label = 'FIR';
  } else if (dept === 'DISASTER_MANAGEMENT') {
    color = '#7c3aed';
    label = 'NDR';
  }

  return L.divIcon({
    className: 'custom-unit-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="background: ${color}; color: white; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); white-space: nowrap;">
          ${label}
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${color};"></div>
      </div>
    `,
    iconSize: [40, 26],
    iconAnchor: [20, 26],
    popupAnchor: [0, -26]
  });
};

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.panTo(center);
    }
  }, [center, map]);
  return null;
}

export function CentralOperationsMap({
  incidents = [],
  units = [],
  selectedIncident,
  onSelectIncident,
  onOpenDispatchModal
}) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    if (filterCategory !== 'ALL' && inc.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && inc.priority !== filterPriority) return false;
    return true;
  });

  const defaultCenter = selectedIncident?.location?.coordinates
    ? [selectedIncident.location.coordinates[1], selectedIncident.location.coordinates[0]]
    : incidents.length > 0 && incidents[0].location?.coordinates
    ? [incidents[0].location.coordinates[1], incidents[0].location.coordinates[0]]
    : [28.5420, 77.2210];

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
      {/* Map Control Bar */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="font-bold text-white uppercase tracking-wider">
            Live Emergency Operations Center Map
          </span>
          <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded text-[11px] border border-slate-700">
            {filteredIncidents.length} Active / {units.length} Fleet Units
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD_ACCIDENT">Road Accident</option>
            <option value="FIRE">Fire Hazard</option>
            <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
            <option value="CRIME">Crime / Hostage</option>
            <option value="BUILDING_COLLAPSE">Collapse / Rescue</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={defaultCenter} />

          {/* Render Active Incident Markers */}
          {filteredIncidents.map((inc) => {
            if (!inc.location?.coordinates || inc.location.coordinates.length < 2) return null;
            const lat = inc.location.coordinates[1];
            const lng = inc.location.coordinates[0];

            return (
              <Marker
                key={inc._id}
                position={[lat, lng]}
                icon={createCategoryIcon(inc.category, inc.priority)}
                eventHandlers={{
                  click: () => onSelectIncident && onSelectIncident(inc)
                }}
              >
                <Popup>
                  <div className="text-xs p-1 font-sans">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 mb-1 gap-2">
                      <span className="font-mono font-bold text-red-600">{inc.referenceId}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inc.priority}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">{inc.title}</p>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{inc.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">📍 {inc.location?.address}</p>

                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-slate-500">
                        Status: <strong className="text-slate-800">{inc.status}</strong>
                      </span>
                      {onOpenDispatchModal && (
                        <button
                          type="button"
                          onClick={() => onOpenDispatchModal(inc)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded text-[10px] shadow cursor-pointer"
                        >
                          Dispatch Units
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render Active Emergency Fleet Units */}
          {units.map((unit) => {
            if (!unit.currentLocation?.coordinates || unit.currentLocation.coordinates.length < 2) return null;
            const lat = unit.currentLocation.coordinates[1];
            const lng = unit.currentLocation.coordinates[0];

            return (
              <Marker
                key={unit._id}
                position={[lat, lng]}
                icon={createUnitIcon(unit.departmentType)}
              >
                <Popup>
                  <div className="text-xs p-1 font-sans">
                    <span className="font-mono font-bold text-indigo-700 block text-xs">{unit.unitIdentifier}</span>
                    <p className="text-[11px] text-slate-700 font-medium">{unit.organizationName || unit.departmentType}</p>
                    <p className="text-[10px] text-slate-500">Staff: {unit.assignedStaffName || 'Officer on duty'}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] bg-slate-100 p-1 rounded">
                      <span>Status:</span>
                      <span className="font-bold text-emerald-700">{unit.status}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">
                      GPS: {lat.toFixed(5)}, {lng.toFixed(5)} ({unit.isSimulatedGps ? 'Simulated' : 'Live'})
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend Strip */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Accident / Collision
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Fire Hazard
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Medical Emergency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Police Unit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Ambulance EMS
          </span>
        </div>
        <div className="text-slate-500 text-[10px]">
          Leaflet OpenStreetMap · Real-Time Telemetry Socket Active
        </div>
      </div>
    </div>
  );
}

export default CentralOperationsMap;

