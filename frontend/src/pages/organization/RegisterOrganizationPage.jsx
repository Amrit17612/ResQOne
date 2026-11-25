import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../services/api';
import { Building2, Activity, CheckCircle2, ArrowRight, ShieldCheck, FileText, MapPin } from 'lucide-react';
import MapLocationPicker from '../../components/maps/MapLocationPicker';

const ORG_TYPES = [
  { id: 'HOSPITAL', label: 'Hospital / Trauma Care Center' },
  { id: 'AMBULANCE_PROVIDER', label: 'Emergency Ambulance Fleet' },
  { id: 'POLICE', label: 'Police Division / Station' },
  { id: 'FIRE_RESCUE', label: 'Fire & Tactical Rescue Station' },
  { id: 'DISASTER_RELIEF_NGO', label: 'Disaster Relief Humanitarian NGO' },
  { id: 'SHELTER_PROVIDER', label: 'Community Evacuation Shelter' }
];

export const RegisterOrganizationPage = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'HOSPITAL',
    officialEmail: '',
    contactNumber: '',
    registrationNumber: '',
    address: '',
    state: 'Delhi',
    district: 'New Delhi',
    city: 'New Delhi',
    postalCode: '110001',
    authorizedPersonName: '',
    authorizedPersonDesignation: '',
    supportingDocumentUrl: 'Document Upload Verified',
    latitude: 28.5420,
    longitude: 77.2210,
    formattedAddress: '',
    locationSource: 'MANUAL_PIN',
    locationAccuracy: null,
    locationConfirmedByUser: false
  });

  const [submittedApp, setSubmittedApp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationConfirmed = (locData) => {
    // Attempt parsing city / state from address string if available
    const parts = (locData.formattedAddress || '').split(',').map(s => s.trim());
    const guessedCity = parts.length >= 3 ? parts[parts.length - 3] : prev => prev.city;
    const guessedState = parts.length >= 2 ? parts[parts.length - 2] : prev => prev.state;

    setFormData((prev) => ({
      ...prev,
      latitude: locData.latitude,
      longitude: locData.longitude,
      formattedAddress: locData.formattedAddress || prev.address,
      locationSource: locData.locationSource,
      locationAccuracy: locData.locationAccuracy,
      locationConfirmedByUser: true,
      address: locData.formattedAddress || prev.address,
      city: typeof guessedCity === 'string' && guessedCity ? guessedCity : prev.city,
      state: typeof guessedState === 'string' && guessedState ? guessedState : prev.state
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.locationConfirmedByUser) {
      setError('Please pinpoint and click "CONFIRM THIS LOCATION" on the map before submitting.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        officialEmail: formData.officialEmail,
        contactNumber: formData.contactNumber,
        registrationNumber: formData.registrationNumber,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        city: formData.city,
        postalCode: formData.postalCode,
        authorizedPersonName: formData.authorizedPersonName,
        authorizedPersonDesignation: formData.authorizedPersonDesignation,
        supportingDocumentUrl: formData.supportingDocumentUrl,
        latitude: formData.latitude,
        longitude: formData.longitude,
        formattedAddress: formData.formattedAddress || formData.address,
        locationSource: formData.locationSource,
        locationAccuracy: formData.locationAccuracy,
        locationConfirmedByUser: formData.locationConfirmedByUser
      };

      const { data } = await api.post('/organizations/apply', payload);
      if (data.success) {
        setSubmittedApp(data);
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Submission failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 font-sans text-slate-100 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-4">
            <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-black">
              ResQ<span className="text-resq-crimson">One</span>
            </span>
          </NavLink>
          <h1 className="text-3xl font-black text-white tracking-tight">Register Your Organization</h1>
          <p className="mt-2 text-xs text-slate-400">
            Hospitals, Municipal Responders & NGOs Onboarding Verification System
          </p>
        </div>

        {submittedApp ? (
          <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-emerald-600 mb-4">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-black text-slate-900">Application Submitted for Super Admin Review</h2>
                <p className="text-xs text-slate-500">Your registration documents and physical location are in the queue.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 my-6 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Application Reference ID</span>
                <span className="text-sm font-mono font-black text-resq-blue bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                  {submittedApp.applicationId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Organization Name:</span>
                <span className="text-slate-900 font-bold">{submittedApp.data?.organizationName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Registered Official Email:</span>
                <span className="text-slate-900 font-bold">{submittedApp.data?.officialEmail}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Physical Location:</span>
                <span className="text-emerald-700 font-mono text-[11px] font-bold">
                  {submittedApp.data?.location?.coordinates?.[1]?.toFixed(5)}, {submittedApp.data?.location?.coordinates?.[0]?.toFixed(5)} (GeoJSON Point)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Current Review Status:</span>
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                  {submittedApp.data?.status || 'APPLICATION_SUBMITTED'}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-resq-blue" />
                What happens next?
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                A Super Admin will review your registration license and verify your station location on the operational map. Once approved, a one-time activation link will be dispatched to your registered email to set your secure master password.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <NavLink
                to="/track-application"
                className="flex-1 bg-resq-blue hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <span>Track Application Status</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
              <NavLink
                to="/"
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2.5 px-6 rounded-xl text-xs transition text-center"
              >
                Return to Landing Page
              </NavLink>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-resq-blue" />
              <h2 className="text-base font-bold text-slate-900">Official Organization Details</h2>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City Apollo Trauma Hospital"
                    value={formData.organizationName}
                    onChange={(e) => handleChange('organizationName', e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Organization Type
                  </label>
                  <select
                    value={formData.organizationType}
                    onChange={(e) => handleChange('organizationType', e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="director@apollohealth.org"
                    value={formData.officialEmail}
                    onChange={(e) => handleChange('officialEmail', e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Official Contact Number (10 Digits)
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      handleChange('contactNumber', e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Govt. Registration / License Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-HOSP-2026-9901"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Official Facility Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street, Landmark"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-resq-blue outline-none"
                  />
                </div>
              </div>

              {/* MODULE A: REAL MAP LOCATION PICKER */}
              <div className="pt-2">
                <MapLocationPicker
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  initialAddress={formData.address}
                  onLocationConfirmed={handleLocationConfirmed}
                  title="Select Your Organization's Exact Location"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Authorized Signatory / Administrator
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Authorized Person Name"
                      value={formData.authorizedPersonName}
                      onChange={(e) =>
                        handleChange(
                          'authorizedPersonName',
                          e.target.value.replace(/[^a-zA-Z\s'.]/g, '')
                        )
                      }
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Official Designation (e.g. Medical Superintendent)"
                      value={formData.authorizedPersonDesignation}
                      onChange={(e) => handleChange('authorizedPersonDesignation', e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-resq-blue outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-resq-blue flex-shrink-0" />
                <span>
                  By submitting, you authorize ResQOne Super Admin personnel to verify registration license records and confirm spatial station coordinates.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-resq-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting Application to Super Admin...' : 'Submit Organization Onboarding Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
