import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  User,
  Check,
  CheckCheck,
  ExternalLink,
  Clock,
  Inbox,
  Filter,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import notificationService from '../services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const [counts, setCounts] = useState({ total: 0, unread: 0, read: 0 });

  useEffect(() => {
    // Subscribe to notification updates from service
    const unsubscribe = notificationService.subscribe((updatedList) => {
      setNotifications(updatedList);
      setCounts(notificationService.getSummaryCounts(updatedList));
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  // Filtered notifications list
  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    return true;
  });

  // Category Icon & Styling Helper
  const getCategoryIcon = (category, severity) => {
    switch (category) {
      case 'safety_alert':
        return {
          icon: AlertTriangle,
          container: 'bg-red-50 text-red-600 border-red-200',
        };
      case 'account':
        return {
          icon: User,
          container: 'bg-purple-50 text-purple-600 border-purple-200',
        };
      case 'incident_status':
      default:
        if (severity === 'success') {
          return {
            icon: CheckCircle2,
            container: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          };
        }
        return {
          icon: ShieldAlert,
          container: 'bg-amber-50 text-amber-600 border-amber-200',
        };
    }
  };

  return (
    <div className="space-y-6 pb-12 antialiased text-slate-900">
      {/* Demo Mode Notice Banner */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Demo Notifications:</strong> Displaying simulated emergency dispatch updates and safety advisories. Read status updates apply to temporary component memory only and will not persist after reload.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] uppercase font-bold">
          Temporary Memory
        </span>
      </div>

      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
            Notifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Stay updated on your emergency reports, dispatch progression, and local safety alerts.
          </p>
        </div>

        {/* Mark All As Read Button */}
        {counts.unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllAsRead}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 self-start sm:self-auto"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs Bar (All vs Unread) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-resq-card flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`
              px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none
              ${activeFilter === 'all'
                ? 'bg-red-50 text-red-700 border border-red-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            All ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`
              px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none flex items-center gap-1.5
              ${activeFilter === 'unread'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            <span>Unread</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${counts.unread > 0 ? 'bg-red-600 text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>
              {counts.unread}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Showing {filteredNotifications.length} of {counts.total} alerts
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const iconConfig = getCategoryIcon(notif.category, notif.severity);
            const Icon = iconConfig.icon;

            return (
              <div
                key={notif.id}
                className={`
                  group rounded-xl p-4 sm:p-4.5 border transition-all shadow-resq-card flex items-start justify-between gap-4
                  ${notif.read
                    ? 'bg-white border-slate-200/90 hover:border-slate-300'
                    : 'bg-white border-l-4 border-l-red-600 border-slate-200 hover:border-slate-300 shadow-resq-elevated'
                  }
                `}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  {/* Category / Status Icon */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${iconConfig.container}`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* Content Body */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-xs sm:text-sm ${
                          notif.read
                            ? 'font-medium text-slate-800'
                            : 'font-bold text-slate-950'
                        }`}
                      >
                        {notif.title}
                      </h3>

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" title="Unread notification" />
                      )}

                      {notif.incidentType && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                          {notif.incidentType}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{notif.timestamp}</span>
                        <span>&bull;</span>
                        <span>{notif.relativeTime}</span>
                      </span>

                      {notif.incidentId && (
                        <Link
                          to={`/incidents/${notif.incidentId}`}
                          className="text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 hover:underline"
                        >
                          <span>Track Incident Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action: Mark as read button */}
                <div className="flex-shrink-0 pt-0.5">
                  {!notif.read ? (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3 text-blue-600" />
                      <span className="hidden sm:inline">Mark as read</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 px-2 py-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="hidden sm:inline">Read</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={activeFilter === 'unread' ? CheckCircle2 : Bell}
          title={activeFilter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
          description={
            activeFilter === 'unread'
              ? 'You have reviewed all reported emergency alerts and safety advisories.'
              : 'There are currently no alerts or dispatch notices in your history.'
          }
          actionLabel={activeFilter === 'unread' ? 'View All Notifications' : undefined}
          onAction={activeFilter === 'unread' ? () => setActiveFilter('all') : undefined}
        />
      )}
    </div>
  );
}
