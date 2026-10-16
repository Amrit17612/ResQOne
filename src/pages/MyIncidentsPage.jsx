import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  MapPin,
  Clock,
  ChevronRight,
  ShieldAlert,
  Info,
  Filter,
  X,
  AlertCircle,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import incidentService from '../services/incidentService';

export default function MyIncidentsPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'in-progress' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState({ total: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    async function loadIncidents() {
      const res = await incidentService.getIncidents();
      setIncidents(res.data);
      const counts = incidentService.getSummaryCounts(res.data);
      setSummary(counts);
    }
    loadIncidents();
  }, []);

  // Filter logic
  const filteredIncidents = incidents.filter((incident) => {
    // 1. Status Tab filter
    if (activeTab === 'in-progress' && incident.status.toLowerCase() !== 'in progress') {
      return false;
    }
    if (activeTab === 'resolved' && incident.status.toLowerCase() !== 'resolved') {
      return false;
    }

    // 2. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchType = incident.type.toLowerCase().includes(q);
      const matchLoc = incident.location.toLowerCase().includes(q);
      const matchDesc = incident.description?.toLowerCase().includes(q);
      return matchType || matchLoc || matchDesc;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12 antialiased text-slate-900">
      {/* Demo Mode Notice Banner */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Demo Incidents:</strong> Showing verified sample incident telemetry for demonstration. Real-time incident logs will synchronize once backend database integration is complete.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] uppercase font-bold">
          3 Demo Records
        </span>
      </div>

      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
            My Incidents
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track the status of all your reported incidents.
          </p>
        </div>

        <Link to="/report">
          <Button variant="primary" size="sm" icon={ShieldAlert}>
            Report New Incident
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-resq-card space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        
        {/* Status Filter Tabs (Matching mockup tabs: All (3), In Progress (1), Resolved (2)) */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`
              px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none
              ${activeTab === 'all'
                ? 'bg-red-50 text-red-700 border border-red-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            All ({summary.total})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('in-progress')}
            className={`
              px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none
              ${activeTab === 'in-progress'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            In Progress ({summary.inProgress})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resolved')}
            className={`
              px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none
              ${activeTab === 'resolved'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            Resolved ({summary.resolved})
          </button>
        </div>

        {/* Search Filter Input */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident or location..."
            className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-7 py-2 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Incidents List (Strictly matching mockup list rows) */}
      {filteredIncidents.length > 0 ? (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => navigate(`/incidents/${incident.id}`)}
              className="group bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 sm:p-4.5 shadow-resq-card transition-all hover:shadow-resq-elevated cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 min-w-0">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <img
                    src={incident.image}
                    alt={incident.type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Info Column */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                      {incident.type}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                      #{incident.id.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{incident.location}</span>
                  </p>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>{incident.formattedDate}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span>{incident.relativeTime}</span>
                  </p>
                </div>
              </div>

              {/* Status Badge & Chevron */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Badge status={incident.status} size="md">
                  {incident.status}
                </Badge>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Matching Incidents Found"
          description={
            searchQuery
              ? `No reported incidents match "${searchQuery}". Try adjusting your keywords or clearing the search filter.`
              : `There are currently no incidents in the "${activeTab}" filter category.`
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Report an Emergency'}
          onAction={() => {
            if (searchQuery) {
              setSearchQuery('');
            } else {
              navigate('/report');
            }
          }}
        />
      )}
    </div>
  );
}
