import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { Home, Package, Droplets, HeartPulse, ShieldAlert, Check } from 'lucide-react';

export const ShelterDashboard = () => {
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const { data } = await api.get('/operations/shelters');
      if (data.success) {
        setShelters(data.shelters);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const adjustOccupancy = async (shelterId, current, delta) => {
    const updated = Math.max(0, current + delta);
    try {
      const { data } = await api.patch(`/operations/shelters/${shelterId}`, {
        occupiedCapacity: updated
      });
      if (data.success) {
        setShelters(shelters.map((s) => (s._id === shelterId ? data.shelter : s)));
      }
    } catch (e) {
      alert('Error updating shelter capacity');
    }
  };

  return (
    <DashboardLayout
      title="Shelter & Relief Resource Grid"
      subtitle="Evacuee Accommodation, Essential Food Rations, Potable Water & Bed Supply"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shelters.map((shelter) => {
            const availableSlots = shelter.totalCapacity - shelter.occupiedCapacity;
            return (
              <div key={shelter._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{shelter.name}</h3>
                    <p className="text-xs text-slate-500">{shelter.location?.address}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      shelter.status === 'FULL'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {shelter.status}
                  </span>
                </div>

                {/* Capacity Counter */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Accommodation</span>
                    <div className="text-2xl font-black text-slate-900">{availableSlots} Slots</div>
                    <span className="text-xs text-slate-500">
                      Total: {shelter.totalCapacity} | Occupied: {shelter.occupiedCapacity}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => adjustOccupancy(shelter._id, shelter.occupiedCapacity, 5)}
                      className="bg-resq-blue hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      +5 Evacuees
                    </button>
                    <button
                      onClick={() => adjustOccupancy(shelter._id, shelter.occupiedCapacity, -5)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      -5 Discharged
                    </button>
                  </div>
                </div>

                {/* Supplies Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <Droplets className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Drinking Water</span>
                    <span className="text-xs font-bold text-slate-800">{shelter.supplies?.drinkingWaterLiters} L</span>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                    <Package className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Food Packets</span>
                    <span className="text-xs font-bold text-slate-800">{shelter.supplies?.foodPackets}</span>
                  </div>

                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                    <Home className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Blankets</span>
                    <span className="text-xs font-bold text-slate-800">{shelter.supplies?.blankets}</span>
                  </div>

                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                    <HeartPulse className="w-4 h-4 text-red-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Medical Kits</span>
                    <span className="text-xs font-bold text-slate-800">{shelter.supplies?.medicalKits}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

