import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker icon paths in bundlers (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// Custom pin marker icon for exact physical location
const pinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to recenter map dynamically
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 15, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Map click & drag handler component
function MapEventsHandler({ onLocationSelect, disabled }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng, 'MANUAL_PIN');
    }
  });
  return null;
}

export default function MapLocationPicker({
  initialLat = 28.6139,
  initialLng = 77.2090,
  initialAddress = '',
  onLocationConfirmed,
  disabled = false,
  title = "Select Your Exact Physical Location"
}) {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [address, setAddress] = useState(initialAddress);
  const [source, setSource] = useState('MANUAL_PIN'); // 'GPS' | 'MANUAL_PIN'
  const [accuracy, setAccuracy] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const markerRef = useRef(null);

  // Reverse geocode via OSM Nominatim API
  const reverseGeocode = async (lat, lng) => {
    setIsReverseGeocoding(true);
    setErrorMessage('');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        const display = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setAddress(display);
        return display;
      }
    } catch (err) {
      console.warn('Geocoding lookup warning:', err.message);
    } finally {
      setIsReverseGeocoding(false);
    }
    const fallback = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setAddress(fallback);
    return fallback;
  };

  // Handle address text search
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMessage('');
    try {
      // Freeform Nominatim query across India & world
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await res.json();
      if (results && results.length > 0) {
        const item = results[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        setPosition([lat, lng]);
        setAddress(item.display_name);
        setSource('MANUAL_PIN');
        setAccuracy(null);
        setIsConfirmed(false);
      } else {
        setErrorMessage('Location not found. Please type City name or Pincode (e.g. Patna, Lucknow, Mumbai, 800001) or click on the map directly.');
      }
    } catch (err) {
      setErrorMessage('Search service busy. You can directly click or drag the red pin anywhere on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Option 1: Browser GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoadingGps(true);
    setErrorMessage('');
    setIsConfirmed(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setPosition([lat, lng]);
        setAccuracy(acc);
        setSource('GPS');
        setIsLoadingGps(false);
        await reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLoadingGps(false);
        setErrorMessage(
          err.code === 1
            ? 'GPS location permission denied. Please select location manually on the map below.'
            : 'Unable to retrieve your current location. Please use the map to pinpoint.'
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Option 2: Pin clicked / dragged on map
  const handlePinUpdate = async (lat, lng, newSource = 'MANUAL_PIN') => {
    setPosition([lat, lng]);
    setSource(newSource);
    setIsConfirmed(false);
    await reverseGeocode(lat, lng);
  };

  // Drag end handler
  const handleMarkerDragEnd = async () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latlng = marker.getLatLng();
      await handlePinUpdate(latlng.lat, latlng.lng, 'MANUAL_PIN');
    }
  };

  // Confirm Location Handler
  const handleConfirmLocation = () => {
    setIsConfirmed(true);
    if (onLocationConfirmed) {
      onLocationConfirmed({
        latitude: position[0],
        longitude: position[1],
        formattedAddress: address,
        locationSource: source,
        locationAccuracy: accuracy,
        isConfirmed: true
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 shadow-xl text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pinpoint physical station/hospital site. Longitude and Latitude are stored with GeoJSON 2dsphere indexing.
          </p>
        </div>

        {/* Option 1: Browser GPS Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={disabled || isLoadingGps}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoadingGps ? (
            <>
              <svg className="animate-spin h-4 w-4 text-indigo-300" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Option 1: Use Current GPS</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Option 2: Search Address or Click Map */}
      <div className="mt-3">
        <form onSubmit={handleSearchAddress} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, landmark or hospital name to position pin..."
            disabled={disabled}
            className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={disabled || isSearching || !searchQuery.trim()}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search Place'}
          </button>
        </form>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-700/80 shadow-inner h-64 sm:h-72 w-full z-0">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={position} zoom={15} />
          <MapEventsHandler onLocationSelect={handlePinUpdate} disabled={disabled} />

          <Marker
            position={position}
            icon={pinIcon}
            draggable={!disabled}
            ref={markerRef}
            eventHandlers={{
              dragend: handleMarkerDragEnd
            }}
          >
            <Popup>
              <div className="text-xs text-slate-800 font-sans p-1">
                <p className="font-bold text-red-600 mb-1">Selected Physical Location</p>
                <p className="text-[11px] leading-snug">{address || 'Drag pin or click to adjust'}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {isReverseGeocoding && (
          <div className="absolute top-2 right-2 z-[1000] bg-slate-900/90 border border-slate-700 text-slate-200 px-3 py-1 rounded-full text-[11px] shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Resolving address...
          </div>
        )}
      </div>

      {/* Coordinate & Address Summary Strip */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-400 block text-[11px]">Latitude & Longitude:</span>
          <span className="font-mono text-cyan-400 font-semibold text-xs">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Source & Accuracy:</span>
          <span className="text-slate-200 font-medium">
            <span className="capitalize">{source.replace('_', ' ').toLowerCase()}</span>
            {accuracy ? ` (±${accuracy}m accuracy)` : ' (Pinned manual location)'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Status:</span>
          {isConfirmed ? (
            <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Location Confirmed
            </span>
          ) : (
            <span className="text-amber-400 font-semibold">Pending User Confirmation</span>
          )}
        </div>
      </div>

      {/* Formatted Address Box */}
      <div className="mt-2 text-xs bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Identified Address:</span>
        <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">
          {address || 'Drag the red pin on the map or click anywhere to pinpoint your exact station.'}
        </p>
      </div>

      {/* Confirmation Action Button */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleConfirmLocation}
          disabled={disabled || isConfirmed}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 ${
            isConfirmed
              ? 'bg-emerald-700/60 text-emerald-200 border border-emerald-500/50 cursor-default'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-red-500'
          }`}
        >
          {isConfirmed ? (
            <>
              <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              LOCATION CONFIRMED
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              CONFIRM THIS LOCATION
            </>
          )}
        </button>
      </div>
    </div>
  );
}

