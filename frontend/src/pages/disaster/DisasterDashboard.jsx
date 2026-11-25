import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { CloudLightning, AlertTriangle, Users, MapPin, Shield } from 'lucide-react';

export const DisasterDashboard = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const { data } = await api.get('/incidents?category=NATURAL_DISASTER');
      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout
      title="Disaster Management & Macro Evacuation Grid"
      subtitle="Regional Crisis Surveillance, Red-Zone Geo-Fencing & Inter-Agency Coordination"
    >
      <div className="space-y-6">
        <div className="bg-purple-950 text-purple-100 p-6 rounded-2xl flex items-center justify-between border border-purple-900 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-800 flex items-center justify-center text-white">
              <CloudLightning className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">National Disaster Response Grid (NDRF)</h2>
              <p className="text-xs text-purple-300">Synchronizing Floods, Earthquakes, Cyclones & Structural Landslides</p>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest bg-purple-900 px-3 py-1.5 rounded-lg border border-purple-700">
            Advisory State: HIGH ALERT
          </span>
        </div>

        {/* Disaster Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Active Hazard Zones</div>
            <div className="text-3xl font-black text-purple-950">2 Sectors</div>
            <p className="text-xs text-slate-500 mt-2">Yamuna River Floodplain & Okhla Industrial Cluster</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Evacuated Citizens</div>
            <div className="text-3xl font-black text-emerald-600">1,240</div>
            <p className="text-xs text-slate-500 mt-2">Re-housed across 4 municipal shelters</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Relief Convoys Dispatched</div>
            <div className="text-3xl font-black text-amber-600">18 Trucks</div>
            <p className="text-xs text-slate-500 mt-2">Water purification and emergency ration packets</p>
          </div>
        </div>

        {/* Hazard List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 pb-3 border-b border-slate-100">
            Regional Crisis Incident Registry
          </h3>
          <div className="space-y-3">
            {incidents.length > 0 ? (
              incidents.map((d) => (
                <div key={d._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">{d.title}</span>
                    <span className="text-red-700 bg-red-100 font-bold px-2 py-0.5 rounded">{d.priority}</span>
                  </div>
                  <p className="text-slate-600">{d.description}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                No active large-scale disaster currently declared. Monitoring regional sensors...
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

