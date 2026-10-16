import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Info,
  Calendar,
  Camera,
  Navigation,
  Check,
  Copy,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import incidentService from '../services/incidentService';

export default function IncidentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function fetchIncident() {
      setLoading(true);
      const res = await incidentService.getIncidentById(id);
      setIncident(res.data);
      setLoading(false);
    }
    fetchIncident();
  }, [id]);

  const handleCopyId = () => {
    if (incident?.id) {
      navigator.clipboard.writeText(incident.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading incident record...</p>
      </div>
    );
  }

  // Not Found State for unknown IDs
  if (!incident) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 antialiased text-slate-900">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-resq-card space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Incident Record Not Found</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
              We could not find an incident matching reference ID <code className="font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-xs">{id}</code>. The record may have been archived or the ID is incorrect.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/incidents">
              <Button variant="primary" size="sm" icon={ArrowLeft}>
                Back to My Incidents
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 antialiased text-slate-900">
      {/* Demo Mode Notice Banner */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Demo Record Notice:</strong> Displaying verified sample incident telemetry for #{incident.id.toUpperCase()}. Timeline and status telemetry reflect sample data until live backend dispatch synchronization is enabled.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] uppercase font-bold">
          Sample Telemetry
        </span>
      </div>

      {/* Back Link & Quick Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/incidents"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors gap-1.5 py-1 group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to My Incidents</span>
        </Link>

        <button
          type="button"
          onClick={handleCopyId}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs transition-colors"
          title="Copy Incident ID"
        >
          {copiedId ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px]">#{incident.id.toUpperCase()}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Incident Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-resq-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Photo / Attachment Preview */}
          <div className="md:col-span-4 lg:col-span-3">
            {incident.image ? (
              <div className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 md:aspect-square">
                <img
                  src={incident.image}
                  alt={incident.type}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-1 rounded flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate">
                    <Camera className="w-3 h-3 text-red-400" />
                    <span>Attached Evidence</span>
                  </span>
                  <span className="text-slate-400">1 Photo</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 aspect-4/3 md:aspect-square flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Camera className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
                <span className="text-xs font-medium text-slate-500">No Photo Attached</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Reported without media upload</span>
              </div>
            )}
          </div>

          {/* Incident Details Summary */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            
            {/* Title & Badge Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                    {incident.type}
                  </h1>
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    #{incident.id.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{incident.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{incident.formattedDate}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span>{incident.relativeTime}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <Badge status={incident.status} size="lg" showDot>
                {incident.status}
              </Badge>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Incident Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
                {incident.description || 'No additional description was provided at the time of reporting.'}
              </p>
            </div>

            {/* Urgent Assistance Disclaimer */}
            <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span>For life-threatening escalation, call local emergency services immediately at <strong className="text-slate-800 font-semibold">112</strong> or <strong className="text-slate-800 font-semibold">108</strong>.</span>
            </div>

          </div>

        </div>
      </div>

      {/* Two-Column Grid: Status Timeline (Left) & Location / GPS Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Status Timeline (Strictly matching mockup stepper) */}
        <Card className="shadow-resq-card">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
              Status Timeline
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Chronological progress of the emergency dispatch and resolution.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {incident.timeline && incident.timeline.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {incident.timeline.map((step, idx) => {
                  const isCompleted = step.completed;
                  const isActive = step.active;
                  const isPending = step.pending;

                  return (
                    <div key={idx} className="relative group">
                      {/* Step Indicator Node */}
                      <div className="absolute -left-6 top-0.5 flex items-center justify-center">
                        {isCompleted && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        )}
                        {isActive && (
                          <div className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75" />
                            <div className="relative w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          </div>
                        )}
                        {isPending && (
                          <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-slate-300 ring-4 ring-white" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isActive
                                ? 'text-red-600'
                                : isCompleted
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.step}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded-full">
                              Active Stage
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-slate-600' : isCompleted ? 'text-slate-500' : 'text-slate-400 italic'}`}>
                          {step.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-xs text-slate-500">
                  Detailed timeline history is unavailable for this incident record.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Chronological dispatch tracking requires live backend integration.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Incident Location & Map Card */}
        <Card className="shadow-resq-card">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
              Incident Location & Telemetry
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Reported geographic coordinates for emergency responders.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            
            {/* Styled Map Container */}
            <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
              {/* Subtle Grid and Map Graphic Background */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Simulated Map Road Accents */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-20,60 Q120,40 240,90 T500,70" stroke="#475569" strokeWidth="8" fill="none" />
                <path d="M60,-20 Q80,100 120,200" stroke="#475569" strokeWidth="6" fill="none" />
                <path d="M220,-20 Q200,100 240,200" stroke="#64748b" strokeWidth="5" fill="none" />
              </svg>

              {/* Pulsing Pin Marker */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-60" />
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white">
                    <MapPin className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <div className="mt-2 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-md border border-slate-700/80 max-w-[200px] truncate text-center">
                  {incident.location}
                </div>
              </div>
            </div>

            {/* Coordinate Details & Action */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Reported Address:</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                  {incident.location}
                </span>
              </div>

              {incident.coordinates && (
                <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 font-medium">GPS Coordinates:</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {incident.coordinates.lat.toFixed(4)}° N, {incident.coordinates.lng.toFixed(4)}° E
                  </span>
                </div>
              )}
            </div>

            {/* External Google Maps Button */}
            {incident.coordinates && (
              <a
                href={`https://www.google.com/maps?q=${incident.coordinates.lat},${incident.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" size="sm" icon={ExternalLink} iconPosition="right" className="w-full">
                  Open in Google Maps
                </Button>
              </a>
            )}

            <div className="text-[11px] text-slate-400 text-center">
              Response teams receive direct telemetry routing to these exact coordinates.
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
