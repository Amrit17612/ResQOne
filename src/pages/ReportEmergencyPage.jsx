import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Flame,
  PlusSquare,
  Waves,
  Construction,
  Shield,
  MoreHorizontal,
  Search,
  MapPin,
  UploadCloud,
  FileImage,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';
import Alert from '../components/common/Alert';
import incidentService from '../services/incidentService';

export default function ReportEmergencyPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 1. Incident Type State (Road Accident selected by default matching mockup)
  const [selectedType, setSelectedType] = useState('Road Accident');

  // 2. Form Fields State
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [gpsStatus, setGpsStatus] = useState(null); // 'locating' | 'success' | 'error'
  const [gpsMessage, setGpsMessage] = useState('');

  // 3. Media Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 4. Submission & Validation States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // 7 Incident Types matching mockup
  const incidentTypes = [
    { id: 'Road Accident', label: 'Road Accident', icon: Car },
    { id: 'Fire', label: 'Fire', icon: Flame },
    { id: 'Medical', label: 'Medical', icon: PlusSquare },
    { id: 'Flood', label: 'Flood', icon: Waves },
    { id: 'Road Blockage', label: 'Road Blockage', icon: Construction },
    { id: 'Crime', label: 'Crime', icon: Shield },
    { id: 'Other', label: 'Other', icon: MoreHorizontal },
  ];

  // Geolocation Handler (Real browser GPS integration)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsMessage('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }

    setGpsStatus('locating');
    setGpsMessage('Accessing device GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const latStr = latitude.toFixed(4);
        const lngStr = longitude.toFixed(4);
        const coordsObj = { lat: latitude, lng: longitude, accuracy };
        setCoordinates(coordsObj);
        setGpsStatus('success');
        setGpsMessage(`GPS Acquired: ${latStr}° N, ${lngStr}° E (within ~${Math.round(accuracy)}m)`);
        
        // Populate location field if empty
        if (!location.trim()) {
          setLocation(`GPS: ${latStr}, ${lngStr} (Accuracy ~${Math.round(accuracy)}m)`);
        }
        if (errors.location) {
          setErrors((prev) => ({ ...prev, location: null }));
        }
      },
      (error) => {
        setGpsStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsMessage('Location permission denied. Please grant permission or type location manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsMessage('GPS position unavailable. Please enter landmark or road name manually.');
            break;
          case error.TIMEOUT:
            setGpsMessage('Location request timed out. Please enter address manually.');
            break;
          default:
            setGpsMessage('Unable to retrieve coordinates. Please enter location manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // File Validation & Handling
  const handleFileChange = (file) => {
    setFileError('');
    if (!file) return;

    // Check size limit (10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError('File exceeds maximum 10MB limit. Please select a smaller photo or video.');
      return;
    }

    // Check mime type (images and videos)
    const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!isValidType) {
      setFileError('Unsupported file type. Please upload a valid image (JPEG, PNG, WebP) or video (MP4, MOV).');
      return;
    }

    setSelectedFile(file);

    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Client Validation
  const validateForm = () => {
    const newErrors = {};

    if (!selectedType) {
      newErrors.type = 'Please select an incident type.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe the emergency incident.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters to provide meaningful details for responders.';
    } else if (description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters.';
    }

    if (!location.trim()) {
      newErrors.location = 'Incident location is required. Enter a landmark, street, or use GPS.';
    } else if (location.trim().length < 3) {
      newErrors.location = 'Please enter a more specific location description.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitResult(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const payload = {
      type: selectedType,
      description: description.trim(),
      location: location.trim(),
      coordinates,
      fileName: selectedFile ? selectedFile.name : null,
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : null,
    };

    const response = await incidentService.submitIncidentReport(payload);
    setIsSubmitting(false);

    // Honest feedback: payload validated on client, backend pending
    setSubmitResult(response);
  };

  const handleResetForm = () => {
    setSelectedType('Road Accident');
    setDescription('');
    setLocation('');
    setCoordinates(null);
    setGpsStatus(null);
    setGpsMessage('');
    removeSelectedFile();
    setErrors({});
    setSubmitResult(null);
  };

  return (
    <div className="space-y-6 pb-12 antialiased text-slate-900">
      {/* Demo Mode / Emergency Safety Notice */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Civic Responsibility Notice:</strong> For life-threatening emergencies requiring immediate assistance, dial <strong>112</strong> immediately.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] uppercase font-bold">
          Emergency Hotline: 112
        </span>
      </div>

      {/* Submission Success Notice (Honest Presentation) */}
      {submitResult && (
        <Alert
          variant="success"
          title="Incident Report Validated (Backend Dispatch Integration Pending)"
          className="shadow-sm"
        >
          <div className="space-y-2 mt-1">
            <p>
              Your report for <strong>{submitResult.data.type}</strong> at <strong>{submitResult.data.location}</strong> passed all client-side validation checks and has been formatted.
            </p>
            <p className="text-xs text-emerald-800">
              Note: Live emergency dispatch to local responders requires backend gateway integration (Team Member 2). Your submission has not been transmitted to real police/fire authorities.
            </p>
            <div className="pt-3 flex flex-wrap gap-2.5">
              <Link to="/incidents">
                <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right">
                  View Recent Incidents
                </Button>
              </Link>
              <Button size="sm" variant="secondary" onClick={handleResetForm}>
                Report Another Incident
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Main Report Form Container */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: Incident Type, Description, Location (7 cols on desktop)
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Incident Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Incident Type <span className="text-red-600">*</span>
              </label>

              {/* Grid of 7 Incident Type Cards (Matching mockup) */}
              <div
                role="radiogroup"
                aria-label="Select incident type"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
              >
                {incidentTypes.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setSelectedType(item.id);
                        if (errors.type) setErrors((prev) => ({ ...prev, type: null }));
                      }}
                      className={`
                        p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all select-none focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1 min-h-[78px]
                        ${isSelected
                          ? 'bg-red-600 text-white shadow-sm font-semibold border border-red-700'
                          : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 shadow-resq-card'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                      <span className="text-xs leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.type && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.type}</p>}
            </div>

            {/* 2. Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="incident-description" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Description <span className="text-red-600">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {description.length} / 1000 characters
                </span>
              </div>

              <textarea
                id="incident-description"
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                }}
                placeholder="Describe what happened, any immediate hazards, or number of individuals involved..."
                className={`
                  block w-full rounded-xl text-sm text-slate-900 bg-white border p-3.5 transition-colors placeholder:text-slate-400 focus:outline-none resize-none shadow-resq-card
                  ${errors.description
                    ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                    : 'border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                  }
                `}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.description}</p>
              )}
            </div>

            {/* 3. Location Field with "Use My Location" GPS Button */}
            <div>
              <label htmlFor="incident-location" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Location <span className="text-red-600">*</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1 rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="incident-location"
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
                    }}
                    placeholder="Search for a location or use my current location"
                    className={`
                      block w-full rounded-lg text-sm text-slate-900 bg-white border pl-10 pr-3.5 py-2.5 transition-colors placeholder:text-slate-400 focus:outline-none shadow-resq-card
                      ${errors.location
                        ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                        : 'border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                      }
                    `}
                  />
                </div>

                {/* "Use My Location" Outline Button (Matching mockup treatment) */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseMyLocation}
                  disabled={gpsStatus === 'locating'}
                  icon={MapPin}
                  className="whitespace-nowrap flex-shrink-0"
                >
                  {gpsStatus === 'locating' ? 'Locating...' : 'Use My Location'}
                </Button>
              </div>

              {/* Geolocation Feedback Alert */}
              {gpsMessage && (
                <div className={`mt-2 text-xs flex items-center gap-1.5 ${
                  gpsStatus === 'success'
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg'
                    : gpsStatus === 'locating'
                    ? 'text-slate-600 bg-slate-50 border border-slate-200 p-2 rounded-lg'
                    : 'text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg'
                }`}>
                  {gpsStatus === 'locating' && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />}
                  {gpsStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {gpsStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                  <span>{gpsMessage}</span>
                </div>
              )}

              {errors.location && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.location}</p>
              )}
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: Upload Photo/Video & Submit Report (5 cols on desktop)
             ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Upload Photo / Video Card (Matching mockup right panel) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Upload Photo / Video (Optional)
              </label>

              {/* Hidden File Picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
                id="emergency-file-picker"
              />

              {/* Drag & Drop Area */}
              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center bg-white shadow-resq-card
                    ${isDragging
                      ? 'border-red-600 bg-red-50/40'
                      : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
                    }
                  `}
                >
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3 border border-red-100">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Drag and drop files here
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    or <span className="text-red-600 font-semibold underline">click to upload</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-3">
                    Supports images and videos (Max 10MB)
                  </p>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-resq-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Incident attachment preview"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
                          <FileImage className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type || 'Media'}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Ready for upload
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Remove selected file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="w-full py-1.5 text-center text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  >
                    Replace with different file
                  </button>
                </div>
              )}

              {fileError && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{fileError}</p>
              )}
            </div>

            {/* Bottom Full-Width Submit Button (Matching mockup treatment) */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                className="shadow-sm font-semibold tracking-wide"
              >
                Submit Report
              </Button>
            </div>

            {/* Helper summary note */}
            <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200/80 text-slate-500 text-[11px] leading-relaxed">
              <p className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <Shield className="w-3.5 h-3.5 text-red-600" />
                Telemetry Verification
              </p>
              Reports are stamped with time and location metadata to assist municipal emergency response teams with route optimization.
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}
