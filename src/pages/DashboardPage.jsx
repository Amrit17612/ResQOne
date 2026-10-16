import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  Info,
  AlertTriangle,
  Flame,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import Card, { CardContent } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import incidentService from '../services/incidentService';
import safetyRainImg from '../assets/safety_rain.jpg';
import carAccidentImg from '../assets/incident_car_accident.jpg';
import rescueImg from '../assets/auth_rescue.jpg';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState({ total: 0, inProgress: 0, resolved: 0 });
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Safety Tips Carousel Data
  const safetyTips = [
    {
      id: 1,
      image: safetyRainImg,
      alt: 'Monsoon safety and rainy driving conditions',
      tag: 'Weather Advisory',
      caption: 'During heavy rain, avoid low lying areas and stay updated.',
      detail: 'Monitor district emergency broadcasts and avoid waterlogged roads or electrical posts.',
    },
    {
      id: 2,
      image: carAccidentImg,
      alt: 'Road safety protocol',
      tag: 'First-Aid Guidance',
      caption: 'In road collisions, turn on hazard lights and confirm personal safety first.',
      detail: 'Keep bystander crowds away from traffic lanes and share live GPS landmarks with dispatch.',
    },
    {
      id: 3,
      image: rescueImg,
      alt: 'Fire safety protocol',
      tag: 'Evacuation Protocol',
      caption: 'Never use elevators during building fires; follow illuminated stairwells.',
      detail: 'Crawl below rising smoke layers and test closed metal doors with the back of your hand.',
    },
  ];

  useEffect(() => {
    // Load incidents and derive summary metrics dynamically
    async function loadData() {
      const result = await incidentService.getIncidents();
      setIncidents(result.data);
      const metrics = incidentService.getSummaryCounts(result.data);
      setSummary(metrics);
    }
    loadData();
  }, []);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % safetyTips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + safetyTips.length) % safetyTips.length);
  };

  return (
    <div className="space-y-6 pb-12 antialiased text-slate-900">
      {/* Demo Mode Notice Banner (Explicit safety rule: transparently state demo mode) */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Demo Mode:</strong> Displaying verified sample citizen incidents. Backend API and authentication integration are pending.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] uppercase font-bold">
          Mock Telemetry
        </span>
      </div>

      {/* =========================================================================
          TOP ROW: Emergency Banner & Summary Stat Cards (Matching mockup)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Prominent Red Emergency Reporting Banner (5 cols on desktop) */}
        <div className="lg:col-span-5">
          <Link
            to="/report"
            className="group block h-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl p-5 sm:p-6 shadow-sm border border-red-700/60 transition-all duration-200 hover:shadow-md relative overflow-hidden"
          >
            {/* Background subtle emergency glow */}
            <div className="absolute right-0 top-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform" />

            <div className="relative z-10 flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                    Report an Emergency
                  </h2>
                  <p className="text-xs text-red-100 mt-0.5 leading-tight">
                    Quickly report an incident and get help.
                  </p>
                </div>
              </div>

              {/* Right Arrow Action */}
              <div className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-red-600 flex items-center justify-center flex-shrink-0 transition-colors shadow-sm ml-2">
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Summary Metric Cards (7 cols on desktop, 3 columns matching mockup) */}
        <div className="lg:col-span-7 grid grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Total Incidents */}
          <Card className="flex flex-col justify-center p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-red-600 leading-none">
              {summary.total}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-2 leading-tight">
              Total Incidents
            </div>
          </Card>

          {/* Card 2: In Progress */}
          <Card className="flex flex-col justify-center p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 leading-none">
              {summary.inProgress}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-2 leading-tight">
              In Progress
            </div>
          </Card>

          {/* Card 3: Resolved */}
          <Card className="flex flex-col justify-center p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 leading-none">
              {summary.resolved}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-2 leading-tight">
              Resolved
            </div>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          MAIN SECTION: Recent Incidents (Left) & Safety Tips (Right)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Incidents (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Incidents
            </h3>
            <Link
              to="/incidents"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Incident Cards List */}
          <div className="space-y-3">
            {incidents.map((incident) => {
              const isResolved = incident.status.toLowerCase() === 'resolved';
              return (
                <div
                  key={incident.id}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  className="group bg-white border border-slate-200/85 hover:border-slate-300 rounded-xl p-3.5 sm:p-4 shadow-resq-card transition-all hover:shadow-resq-elevated cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    {/* Thumbnail Image */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <img
                        src={incident.image}
                        alt={incident.type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Incident Details */}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                        {incident.type}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{incident.location}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{incident.relativeTime}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Chevron */}
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    <Badge status={incident.status} size="sm">
                      {incident.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Safety Tips (5 cols on desktop, matching mockup) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Safety Tips
            </h3>
            {/* Working Carousel Step Controls */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={prevTip}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus:outline-none"
                aria-label="Previous safety tip"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextTip}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus:outline-none"
                aria-label="Next safety tip"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Safety Card with Working Carousel */}
          <Card className="overflow-hidden border-slate-200/90 shadow-resq-card">
            <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
              <img
                src={safetyTips[currentTipIndex].image}
                alt={safetyTips[currentTipIndex].alt}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Tag overlay */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide border border-white/10">
                  {safetyTips[currentTipIndex].tag}
                </span>
              </div>
            </div>

            <CardContent className="p-4 sm:p-5 space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                {safetyTips[currentTipIndex].caption}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {safetyTips[currentTipIndex].detail}
              </p>

              {/* Functional Pagination Dots */}
              <div className="pt-2 flex items-center justify-center space-x-1.5">
                {safetyTips.map((tip, idx) => (
                  <button
                    key={tip.id}
                    type="button"
                    onClick={() => setCurrentTipIndex(idx)}
                    className={`h-2 rounded-full transition-all focus:outline-none ${
                      idx === currentTipIndex
                        ? 'w-6 bg-red-600'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
