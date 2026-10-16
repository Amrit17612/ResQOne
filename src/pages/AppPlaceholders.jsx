import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  FileText,
  User,
  Bell,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export function ProfilePlaceholder() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="text-center py-12 space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Citizen Profile Management</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Citizen personal info, emergency contacts, password change, and preferences are scheduled for <strong>Milestone 8</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotificationsPlaceholder() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="text-center py-12 space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Real-time Emergency Notifications</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Incident progress notifications, weather/safety alerts, and mark-as-read controls are scheduled for <strong>Milestone 8</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
