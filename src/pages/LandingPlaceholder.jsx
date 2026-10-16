import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';

export default function LandingPlaceholder() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Milestone 2 Active — Foundation &amp; Design System</span>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          ResQ<span className="text-red-600">One</span> Citizen Portal
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          The shared layout, navigation, and reusable components have been established.
          Full landing page experience will be implemented in <strong className="text-slate-900 font-semibold">Milestone 3</strong> matching the reference mockup.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/design-system">
          <Button variant="primary" size="lg" icon={Sparkles}>
            Explore Design System
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" size="lg" icon={ArrowRight} iconPosition="right">
            Preview Citizen App Shell
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
        <Card>
          <CardContent className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
              M2
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Design System &amp; Tokens</h3>
            <p className="text-xs text-slate-500">
              Emergency red tokens, deep navy sidebar, status badges, and accessible controls.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
              M3
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Upcoming: Landing Page</h3>
            <p className="text-xs text-slate-500">
              Hero split section, emergency response ambulance visual, feature pills, and CTAs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
              M4
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Upcoming: Citizen Auth</h3>
            <p className="text-xs text-slate-500">
              Split-screen login and registration pages matching mockup rescue imagery.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
