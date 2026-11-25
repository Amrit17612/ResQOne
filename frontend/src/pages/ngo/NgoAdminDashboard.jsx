import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CentralOperationsMap } from '../../components/maps/CentralOperationsMap';
import {
  HeartHandshake,
  Package,
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Radio,
  PlusCircle
} from 'lucide-react';

export const NgoAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('REQUESTS'); // 'REQUESTS' | 'TASKS' | 'VOLUNTEERS' | 'MAP'
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [actionMessage, setActionMessage] = useState('');

  // Task creation state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    urgency: 'HIGH',
    address: 'Relief Point'
  });

  useEffect(() => {
    fetchNgoData();
    const interval = setInterval(fetchNgoData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNgoData = async () => {
    try {
      const [reqRes, volRes, taskRes] = await Promise.all([
        api.get('/emergency-requests?departmentType=NGO'),
        api.get('/ngo-admin/volunteers'),
        api.get('/ngo-admin/tasks')
      ]);

      if (reqRes.data.success) setRequests(reqRes.data.requests || []);
      if (volRes.data.success) setVolunteers(volRes.data.volunteers || []);
      if (taskRes.data.success) setTasks(taskRes.data.tasks || []);
    } catch (e) {
      console.warn('NGO data fetch note:', e.message);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const { data } = await api.put(`/emergency-requests/${requestId}/accept`, {
        estimatedResponseMinutes: 25
      });
      if (data.success) {
        setActionMessage(`NGO Relief Request accepted: ${data.request.requestId}`);
        fetchNgoData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept relief request');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/ngo-admin/tasks', newTask);
      if (data.success) {
        setActionMessage(`Relief task dispatched: ${data.task.title}`);
        setNewTask({ title: '', description: '', urgency: 'HIGH', address: 'Relief Point' });
        fetchNgoData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  return (
    <DashboardLayout
      title="NGO & Disaster Relief Command"
      subtitle="Community Volunteers, Food & Ration Supplies, Medical Kits & Ground Humanitarian Aid Grid"
    >
      <div className="space-y-6">
        {actionMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 p-3 rounded-xl text-emerald-200 text-xs flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {actionMessage}
            </span>
            <button onClick={() => setActionMessage('')} className="text-emerald-400 hover:text-white font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pending Relief Requests</p>
              <p className="text-2xl font-black text-slate-800">{requests.filter(r => r.status === 'REQUEST_CREATED').length}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg text-rose-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Relief Tasks</p>
              <p className="text-2xl font-black text-slate-800">{tasks.length}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Registered Volunteers</p>
              <p className="text-2xl font-black text-slate-800">{volunteers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Relief Status</p>
              <p className="text-sm font-bold text-emerald-700">GRID ACTIVE</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'REQUESTS'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Radio className="w-4 h-4" /> Incoming Relief Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'TASKS'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" /> Relief Work Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('MAP')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'MAP'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" /> Relief Ground Map
          </button>
        </div>

        {/* Tab 1: Requests */}
        {activeTab === 'REQUESTS' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                No pending relief requests currently queued.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map(reqItem => (
                  <div
                    key={reqItem._id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-rose-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">
                          {reqItem.requestId}
                        </span>
                        <span className={`text-xs px-2 py-0.5 font-bold rounded ${
                          reqItem.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reqItem.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {reqItem.incidentId?.title || 'Relief Support Request'}
                      </h4>
                      <p className="text-sm text-slate-600">
                        Disaster Incident: <strong>{reqItem.incidentId?.category}</strong> | Severity: <strong className="text-rose-600">{reqItem.incidentId?.severity}</strong>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {reqItem.incidentId?.location?.address || 'Disaster site coordinates logged'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {reqItem.status === 'REQUEST_CREATED' && (
                        <button
                          onClick={() => handleAcceptRequest(reqItem._id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept Relief Mandate
                        </button>
                      )}
                      {reqItem.status === 'ACCEPTED' && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Relief Deployment Mobilized
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Tasks */}
        {activeTab === 'TASKS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-rose-600" /> Dispatch Volunteer Task
              </h3>
              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-rose-500"
                    placeholder="Dry Ration & Drinking Water Distribution"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description & Requirements</label>
                  <textarea
                    required
                    rows={3}
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-rose-500"
                    placeholder="Distribute 500 meal packets at community shelter zone."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relief Location</label>
                  <input
                    type="text"
                    required
                    value={newTask.address}
                    onChange={e => setNewTask({ ...newTask, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Publish Task to Volunteer Network
                </button>
              </form>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-600" /> Active Relief Missions ({tasks.length})
              </h3>
              <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t._id} className="p-3 border rounded-lg flex justify-between items-center bg-slate-50">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{t.title}</h5>
                      <p className="text-[11px] text-slate-600">{t.description}</p>
                      <span className="text-[10px] text-slate-400">Location: {t.location?.address}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Map */}
        {activeTab === 'MAP' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <CentralOperationsMap />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

