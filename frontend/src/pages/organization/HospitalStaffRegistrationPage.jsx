import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Activity, ShieldCheck, Stethoscope, Truck, HeartHandshake, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

const HOSPITAL_ROLES = [
  { id: 'AMBULANCE_DRIVER', label: 'Ambulance Emergency Driver' },
  { id: 'DOCTOR', label: 'Emergency Physician / Specialist Doctor' },
  { id: 'NURSE', label: 'Triage / Trauma Care Nurse' },
  { id: 'BED_MANAGER', label: 'Hospital Bed Manager' },
  { id: 'HOSPITAL_EMERGENCY_COORDINATOR', label: 'Hospital Emergency Coordinator' }
];

export const HospitalStaffRegistrationPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('AMBULANCE_DRIVER');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    qualifications: '',
    relevantExperience: '',
    professionalRegistrationNumber: '',
    specialty: 'Emergency Medicine',
    drivingLicenseNumber: '',
    licenseValidity: '',
    vehicleCategory: 'Commercial Emergency Ambulance (HMV/LMV)'
  });

  const [submittedApp, setSubmittedApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEligibleHospitals(role);
  }, [role]);

  const fetchEligibleHospitals = async (selectedRole) => {
    setLoadingHospitals(true);
    try {
      const { data } = await api.get(`/staff-applications/eligible-organizations?role=${selectedRole}`);
      if (data.success) {
        setHospitals(data.organizations || []);
        if (data.organizations?.length > 0) {
          setSelectedHospitalId(data.organizations[0]._id);
        }
      }
    } catch (e) {
      console.warn('Error fetching eligible hospitals:', e.message);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedHospitalId) {
      setError('Please select an approved hospital facility.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        requestedRole: role,
        organizationId: selectedHospitalId
      };

      const { data } = await api.post('/staff-applications/apply', payload);
      if (data.success) {
        setSubmittedApp(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 font-sans text-slate-100 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center space-x-2 text-white mb-3">
            <div className="w-10 h-10 rounded-xl bg-resq-crimson flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-black">
              ResQ<span className="text-resq-crimson">One</span>
            </span>
          </NavLink>
          <h1 className="text-3xl font-black text-white tracking-tight">Hospital Staff Onboarding Portal</h1>
          <p className="mt-2 text-xs text-slate-400">
            Apply to join an approved hospital network. Applications are routed directly to the selected Hospital Administrator.
          </p>
        </div>

        {submittedApp ? (
          <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-emerald-600 mb-4">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-black text-slate-900">Application Transmitted Directly to Hospital Admin</h2>
                <p className="text-xs text-slate-500">Your professional credentials are under hospital verification.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 my-6 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Staff Application ID</span>
                <span className="text-sm font-mono font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200">
                  {submittedApp.applicationId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Requested Role:</span>
                <span className="text-slate-900 font-bold">{role.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Hospital Destination:</span>
                <span className="text-indigo-900 font-bold">
                  {hospitals.find((h) => h._id === selectedHospitalId)?.organizationName || 'Selected Hospital'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Application Status:</span>
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                  {submittedApp.status}
                </span>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 text-xs text-indigo-900 leading-relaxed">
              <strong>Strict Hospital Isolation:</strong> Your application has been routed exclusively to this Hospital's private management queue. Once approved by the Hospital Admin, you will receive a secure activation link via email to set your master password and access your individual staff dashboard.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <NavLink
                to="/staff-application-status"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <span>Track Application Progress</span>
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
          <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200">
            <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Hospital Staff Application Form</h2>
                <p className="text-xs text-slate-500">Government Police/Fire personnel cannot register here.</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                Model A: Application-Based
              </span>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Select Your Hospital Profession / Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                >
                  {HOSPITAL_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Approved Hospital Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1 flex items-center justify-between">
                  <span>Select Target Hospital Facility (Approved & Active Only)</span>
                  {loadingHospitals && <span className="text-indigo-600 text-[10px]">Loading facilities...</span>}
                </label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  disabled={loadingHospitals || hospitals.length === 0}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900 bg-indigo-50/40"
                >
                  {hospitals.length === 0 ? (
                    <option value="">No approved hospitals found in database</option>
                  ) : (
                    hospitals.map((hosp) => (
                      <option key={hosp._id} value={hosp._id}>
                        {hosp.organizationName} — {hosp.city || hosp.district || hosp.address}
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  📍 Real-time dynamic query: Only organizations verified by Super Admin with status = APPROVED appear.
                </span>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Khanna / Suresh Rawat"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value.replace(/[^a-zA-Z\s'.]/g, ''))}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@example.org"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contact Mobile (10 Digits)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Residential Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Street, City, Pincode"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Role-Specific Fields */}
              {role === 'AMBULANCE_DRIVER' && (
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                  <span className="text-xs font-bold uppercase text-amber-900 block">Ambulance Driver Credentials</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Driving License Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL-04201800921"
                        value={formData.drivingLicenseNumber}
                        onChange={(e) => handleChange('drivingLicenseNumber', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">License Validity Date</label>
                      <input
                        type="date"
                        required
                        value={formData.licenseValidity}
                        onChange={(e) => handleChange('licenseValidity', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'DOCTOR' && (
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
                  <span className="text-xs font-bold uppercase text-blue-900 block">Physician / Doctor Credentials</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Medical Registration Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MCI-2016-99014"
                        value={formData.professionalRegistrationNumber}
                        onChange={(e) => handleChange('professionalRegistrationNumber', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Medical Specialty</label>
                      <select
                        value={formData.specialty}
                        onChange={(e) => handleChange('specialty', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none font-semibold text-slate-800"
                      >
                        <option value="Emergency Medicine">Emergency Medicine</option>
                        <option value="Trauma Surgery">Trauma Surgery</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Critical Care ICU">Critical Care ICU</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* General Qualifications */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Qualifications & Years of Relevant Experience
                </label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD Emergency Medicine, 5 years experience at Trauma Center"
                  value={formData.qualifications}
                  onChange={(e) => handleChange('qualifications', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                🔒 By submitting, you acknowledge that only the Administrator of the selected hospital will have access to review and verify your application credentials.
              </div>

              <button
                type="submit"
                disabled={submitting || hospitals.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Transmitting to Hospital Admin...' : 'Submit Application to Selected Hospital'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

