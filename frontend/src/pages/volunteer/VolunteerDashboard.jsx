import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, CheckCircle2, Clock, Award, ShieldCheck } from 'lucide-react';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/operations/volunteers/tasks');
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const claimTask = async (taskId) => {
    try {
      const { data } = await api.patch(`/operations/volunteers/tasks/${taskId}/assign`, {
        volunteerId: user?._id || user?.id,
        volunteerName: user?.name || 'Vetted Volunteer'
      });
      if (data.success) {
        alert('Task successfully claimed! Follow safety procedures.');
        fetchTasks();
      }
    } catch (e) {
      alert('Error claiming task');
    }
  };

  const completeTask = async (taskId) => {
    try {
      const { data } = await api.patch(`/operations/volunteers/tasks/${taskId}/status`, {
        status: 'COMPLETED'
      });
      if (data.success) {
        alert('Great work! Task marked as completed.');
        fetchTasks();
      }
    } catch (e) {
      alert('Error updating task');
    }
  };

  return (
    <DashboardLayout
      title="Community Volunteer & Humanitarian Task Board"
      subtitle="Relief Parcel Distribution, Shelter Intake Support & Non-Clinical Field Assistance"
    >
      <div className="space-y-6">
        <div className="bg-cyan-950 text-cyan-100 p-6 rounded-2xl flex items-center justify-between border border-cyan-900 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-800 flex items-center justify-center text-white">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Volunteer Force Status: Active Responder</h2>
              <p className="text-xs text-cyan-300">Vetted non-clinical tasks assigned by Disaster & Shelter coordinators</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold bg-cyan-900 px-3 py-1.5 rounded-lg border border-cyan-700">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Completed Badges: 4</span>
          </div>
        </div>

        {/* Task Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sample Task 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  OPEN TASK
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Immediate
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Potable Water & Meal Packet Distribution</h3>
              <p className="text-xs text-slate-500 mb-3">
                Assisting JLN Stadium shelter intake by distributing 400 ration packets to newly arrived evacuee families.
              </p>
              <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Location: Lodhi Road Shelter Gate 3
              </div>
            </div>

            <button
              onClick={() => alert('Task registered to your volunteer profile!')}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Claim Task Assignment
            </button>
          </div>

          {/* Sample Task 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  IN PROGRESS
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Ongoing
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Temporary Shelter Bed Setup</h3>
              <p className="text-xs text-slate-500 mb-3">
                Unloading 50 folding cots and thermal blankets from NDRF logistics trucks at Community Center.
              </p>
              <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Location: Okhla Relief Camp
              </div>
            </div>

            <button
              onClick={() => alert('Marked task as completed. Points credited!')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Mark Task Completed
            </button>
          </div>

          {/* Sample Task 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  OPEN TASK
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Tomorrow 08:00
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">First Aid Station Crowd Coordination</h3>
              <p className="text-xs text-slate-500 mb-3">
                Guiding minor injured patients to outpatient desks and keeping emergency ambulance bays clear.
              </p>
              <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Location: Max Hospital Emergency Entrance
              </div>
            </div>

            <button
              onClick={() => alert('Task registered to your volunteer profile!')}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Claim Task Assignment
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

