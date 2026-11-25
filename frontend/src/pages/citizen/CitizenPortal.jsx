import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { getOfflineDrafts, saveOfflineDraft, removeOfflineDraft } from '../../services/offlineSync';
import {
  AlertCircle,
  MapPin,
  Clock,
  Send,
  WifiOff,
  CheckCircle,
  Hospital as HospitalIcon,
  Search,
  PhoneCall,
  Activity
} from 'lucide-react';
import CitizenLiveTracking from '../../components/citizen/CitizenLiveTracking';

const CATEGORIES = [
  { value: 'ROAD_ACCIDENT', label: 'Road Accident' },
  { value: 'FIRE', label: 'Fire Emergency' },
  { value: 'CRIME', label: 'Crime / Public Safety' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency' },
  { value: 'NATURAL_DISASTER', label: 'Natural Disaster' },
  { value: 'FLOOD', label: 'Flood' },
  { value: 'EARTHQUAKE', label: 'Earthquake' },
  { value: 'BUILDING_COLLAPSE', label: 'Building Collapse' },
  { value: 'RESCUE_REQUEST', label: 'Rescue Required' },
  { value: 'LANDSLIDE', label: 'Landslide' },
  { value: 'CYCLONE', label: 'Cyclone / Storm' },
  { value: 'CLOUDBURST', label: 'Cloudburst' },
  { value: 'EVACUATION_REQUIRED', label: 'Emergency Evacuation' },
  { value: 'RELIEF_REQUIRED', label: 'Relief Assistance Required' },
  { value: 'OTHER', label: 'Other Emergency' }
];

const SUBCATEGORIES = {
  FIRE: [
    { value: 'BUILDING_FIRE', label: 'Building Fire' },
    { value: 'INDUSTRIAL_FIRE', label: 'Industrial Fire' },
    { value: 'FOREST_FIRE', label: 'Forest Fire' },
    { value: 'VEHICLE_FIRE', label: 'Vehicle Fire' },
    { value: 'GAS_LEAKAGE', label: 'Gas Leakage / Explosion Risk' },
    { value: 'ELECTRICAL_FIRE', label: 'Electrical Fire' },
    { value: 'OTHER_FIRE', label: 'Other Fire' }
  ],
  ROAD_ACCIDENT: [
    { value: 'VEHICLE_COLLISION', label: 'Vehicle Collision' },
    { value: 'MAJOR_ROAD_ACCIDENT', label: 'Major Road Accident' },
    { value: 'VEHICLE_ROLLOVER', label: 'Vehicle Rollover' },
    { value: 'PUBLIC_TRANSPORT_ACCIDENT', label: 'Public Transport / Bus Accident' },
    { value: 'ROAD_BLOCKAGE', label: 'Road Blockage / Traffic Jam' }
  ],
  MEDICAL_EMERGENCY: [
    { value: 'CARDIAC_EMERGENCY', label: 'Cardiac Emergency / Heart Attack' },
    { value: 'SERIOUS_INJURY', label: 'Serious Injury / Trauma' },
    { value: 'MULTIPLE_CASUALTIES', label: 'Multiple Casualties' },
    { value: 'AMBULANCE_REQUIRED', label: 'Immediate Ambulance Required' },
    { value: 'OTHER_MEDICAL', label: 'Other Medical Condition' }
  ],
  CRIME: [
    { value: 'THEFT_ROBBERY', label: 'Theft / Robbery' },
    { value: 'ASSAULT_VIOLENCE', label: 'Assault / Violence' },
    { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity' },
    { value: 'PUBLIC_SAFETY_THREAT', label: 'Public Safety Threat' },
    { value: 'MISSING_PERSON', label: 'Missing Person' },
    { value: 'OTHER_CRIME', label: 'Other Public Crime' }
  ],
  NATURAL_DISASTER: [
    { value: 'FLASH_FLOOD', label: 'Flash Flood' },
    { value: 'MAJOR_STRUCTURAL_DAMAGE', label: 'Major Structural Damage' },
    { value: 'OTHER_DISASTER', label: 'Other Natural Hazard' }
  ],
  RESCUE_REQUEST: [
    { value: 'TRAPPED_PERSON', label: 'Person Trapped in Debris / Lift' },
    { value: 'WATER_RESCUE', label: 'Water / River Rescue' },
    { value: 'BUILDING_RESCUE', label: 'High-Rise / Building Rescue' },
    { value: 'VEHICLE_RESCUE', label: 'Trapped in Vehicle' },
    { value: 'OTHER_RESCUE', label: 'Other Rescue Situation' }
  ],
  RELIEF_REQUIRED: [
    { value: 'FOOD_WATER', label: 'Drinking Water & Food Packets' },
    { value: 'MASS_DISPLACEMENT', label: 'Mass Displacement Relief' },
    { value: 'SHELTER_REQUIRED', label: 'Temporary Camp Shelter' },
    { value: 'LARGE_SCALE_RELIEF', label: 'Large-Scale Relief Supplies' },
    { value: 'MEDICAL_RELIEF', label: 'First Aid & Medical Relief' },
    { value: 'OTHER_RELIEF', label: 'Other Relief Assistance' }
  ]
};

export const CitizenPortal = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ROAD_ACCIDENT');
  const [subcategory, setSubcategory] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [address, setAddress] = useState('Connaught Place Inner Circle, New Delhi');
  const [lat, setLat] = useState(28.6315);
  const [lng, setLng] = useState(77.2167);

  const [hospitals, setHospitals] = useState([]);
  const [referenceId, setReferenceId] = useState('');
  const [trackInput, setTrackInput] = useState('');
  const [trackedIncident, setTrackedIncident] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [evidenceException, setEvidenceException] = useState('IMMEDIATE_EMERGENCY');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHospitals();
    setOfflineDrafts(getOfflineDrafts());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data } = await api.get('/hospitals');
      if (data.success) {
        setHospitals(data.hospitals);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (reporterPhone && reporterPhone.length !== 10) {
      alert('Please enter a valid 10-digit emergency contact number or leave it blank.');
      return;
    }
    setSubmitting(true);
    setMessage('');

    const payload = {
      title,
      description,
      category,
      subcategory: subcategory || undefined,
      reporterName: reporterName || 'Anonymous Citizen',
      reporterPhone: reporterPhone ? `+91 ${reporterPhone}` : 'Not provided',
      address,
      latitude: lat,
      longitude: lng
    };

    if (!isOnline) {
      saveOfflineDraft(payload);
      setOfflineDrafts(getOfflineDrafts());
      setMessage('Network offline! Incident securely saved to Offline Drafts. It will sync once connection returns.');
      setSubmitting(false);
      resetForm();
      return;
    }

    try {
      const { data } = await api.post('/incidents', payload);
      if (data.success) {
        setReferenceId(data.incident.referenceId);
        setMessage(`Emergency Logged Successfully! Unique Tracking ID: ${data.incident.referenceId}`);
        resetForm();
      }
    } catch (err) {
      // If server failed, save to offline queue
      saveOfflineDraft(payload);
      setOfflineDrafts(getOfflineDrafts());
      setMessage('Server unreachable. Saved to Offline Drafts queue.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
  };

  const syncDraft = async (draft) => {
    try {
      const { data } = await api.post('/incidents', draft);
      if (data.success) {
        removeOfflineDraft(draft.id);
        setOfflineDrafts(getOfflineDrafts());
        alert(`Draft synced successfully! Assigned ID: ${data.incident.referenceId}`);
      }
    } catch (e) {
      alert('Unable to sync draft. Server unreachable.');
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackInput) return;
    try {
      const { data } = await api.get(`/incidents/track/${trackInput.trim()}`);
      if (data.success) {
        setTrackedIncident(data.incident);
      }
    } catch (e) {
      alert('Incident reference not found.');
      setTrackedIncident(null);
    }
  };

  return (
    <DashboardLayout
      title="Citizen Emergency Portal"
      subtitle="Public Incident Reporting, Verified Hospital Bed Locator & Live Response Tracking"
    >
      <div className="space-y-8">
        {/* Connection status banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-white px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg">
            <WifiOff className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <span className="text-sm font-semibold">
              Offline Mode Activated: Reports will be stored locally in browser storage and can be transmitted once connectivity is restored.
            </span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-sm font-semibold text-emerald-800 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 2-Column Grid: Report Form vs Hospital Bed Finder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Emergency Submission Form */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <AlertCircle className="w-5 h-5 text-resq-crimson" />
              <h2 className="text-lg font-bold text-slate-800">Report an Immediate Emergency</h2>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Incident Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory('');
                  }}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {SUBCATEGORIES[category] && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Specific Subcategory / Incident Type (Optional)
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full text-sm border border-indigo-200 bg-indigo-50/40 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- General / Not Specified --</option>
                    {SUBCATEGORIES[category].map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Incident Headline / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2-car collision with fire at intersection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Detailed Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe trapped victims, visible hazards, injuries, smoke, or water level..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Your Full Name (Letters Only)
                  </label>
                  <input
                    type="text"
                    placeholder="Citizen Name (e.g. Rohan Sharma)"
                    value={reporterName}
                    onChange={(e) => {
                      // Allow only alphabets and spaces
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s'.]/g, '');
                      setReporterName(lettersOnly);
                    }}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Emergency Contact Number (10 Digits)
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={reporterPhone}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setReporterPhone(onlyDigits);
                    }}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                  {reporterPhone && reporterPhone.length < 10 && (
                    <span className="text-[11px] text-amber-600 mt-1 block">
                      Enter 10-digit mobile number ({reporterPhone.length}/10)
                    </span>
                  )}
                </div>
              </div>

              {/* Conditional Evidence Policy Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-700">Incident Evidence / Photo</span>
                  {['ROAD_ACCIDENT', 'FIRE', 'BUILDING_COLLAPSE'].includes(category) ? (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">
                      Photo Required (Or Emergency Exception)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                      Optional for Medical / Crime
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="photoOption"
                      checked={hasPhoto}
                      onChange={() => setHasPhoto(true)}
                    />
                    <span className="font-semibold text-slate-700">I have an incident photo</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="photoOption"
                      checked={!hasPhoto}
                      onChange={() => setHasPhoto(false)}
                    />
                    <span className="font-semibold text-amber-700">Emergency Exception (Unable to take photo)</span>
                  </label>
                </div>

                {hasPhoto ? (
                  <div>
                    <input
                      type="text"
                      placeholder="Paste Image URL or camera link (JPG, PNG, WEBP)"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-resq-blue outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">
                      Select Safety / Emergency Exemption Reason:
                    </label>
                    <select
                      value={evidenceException}
                      onChange={(e) => setEvidenceException(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-amber-900 bg-amber-50/50"
                    >
                      <option value="IMMEDIATE_EMERGENCY">Immediate emergency — help is needed now</option>
                      <option value="UNSAFE_TO_PHOTOGRAPH">Taking a photo is unsafe</option>
                      <option value="VICTIM_INJURED">Reporter or victim is injured</option>
                      <option value="CAMERA_NETWORK_UNAVAILABLE">Camera or network unavailable</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <MapPin className="w-4 h-4 text-resq-blue" />
                <span>GPS Coords: [{lat.toFixed(4)}, {lng.toFixed(4)}]</span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLat(pos.coords.latitude);
                          setLng(pos.coords.longitude);
                          alert('GPS Coordinates updated from browser location.');
                        },
                        () => alert('Unable to fetch GPS. Defaulting to Delhi NCR.')
                      );
                    }
                  }}
                  className="ml-auto text-resq-blue font-semibold hover:underline"
                >
                  Locate Me
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-resq-crimson text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow-lg flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitting to Central Admin...' : 'Transmit Emergency Alert'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Track Report & Offline Queue */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Tracking Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Search className="w-5 h-5 text-resq-blue" />
                <h2 className="text-base font-bold text-slate-800">Track Emergency Report</h2>
              </div>

              <form onSubmit={handleTrack} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter Reference ID (e.g. RESQ-20261104-0001)"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                />
                <button
                  type="submit"
                  className="bg-resq-blue text-white px-4 text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Track
                </button>
              </form>

              {trackedIncident && (
                <div className="mt-4">
                  <CitizenLiveTracking incident={trackedIncident} />
                </div>
              )}
            </div>

            {/* Offline Drafts Queue */}
            {offlineDrafts.length > 0 && (
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-amber-900 flex items-center space-x-1.5">
                    <WifiOff className="w-4 h-4 text-amber-700" />
                    <span>Offline Incident Queue ({offlineDrafts.length})</span>
                  </h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {offlineDrafts.map((draft) => (
                    <div key={draft.id} className="bg-white p-3 rounded-lg border border-amber-200 text-xs flex justify-between items-center">
                      <div className="truncate mr-2">
                        <span className="font-bold block text-slate-800 truncate">{draft.title}</span>
                        <span className="text-[10px] text-slate-400">{draft.savedAt}</span>
                      </div>
                      <button
                        onClick={() => syncDraft(draft)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2.5 py-1 rounded text-[11px] flex-shrink-0"
                      >
                        Sync
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Hospitals & Verified Bed Capacities */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <HospitalIcon className="w-5 h-5 text-teal-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-800">Verified Nearby Emergency Hospitals</h2>
                <p className="text-xs text-slate-500">Live Bed Board, Trauma Facilities & Emergency Hotlines</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hospitals.map((hosp) => (
              <div key={hosp._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-sm">{hosp.name}</h3>
                    {hosp.hasTraumaCenter && (
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">
                        TRAUMA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{hosp.address}</p>

                  {/* Bed Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-lg border border-slate-200 mb-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">General</span>
                      <span className="text-sm font-bold text-slate-800">
                        {hosp.beds?.GENERAL ? hosp.beds.GENERAL.total - hosp.beds.GENERAL.occupied : 0}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold text-red-600">ICU</span>
                      <span className="text-sm font-bold text-red-600">
                        {hosp.beds?.ICU ? hosp.beds.ICU.total - hosp.beds.ICU.occupied : 0}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold text-amber-600">Oxygen</span>
                      <span className="text-sm font-bold text-amber-600">
                        {hosp.beds?.OXYGEN_SUPPORT ? hosp.beds.OXYGEN_SUPPORT.total - hosp.beds.OXYGEN_SUPPORT.occupied : 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <a
                    href={`tel:${hosp.emergencyHotline}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Hotline: {hosp.emergencyHotline}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

