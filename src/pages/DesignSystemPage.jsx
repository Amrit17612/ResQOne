import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  AlertTriangle,
  Search,
  Lock,
  Mail,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sampleInput, setSampleInput] = useState('');
  const [inputError, setInputError] = useState('');

  return (
    <div className="space-y-10 pb-16">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-lg bg-red-100 text-red-600">
            <Sparkles className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-bold text-slate-900">ResQOne Design System &amp; Component Library</h2>
        </div>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Derived from the official ResQOne Emergency Response UI Mockup. These tokens and reusable components ensure strict visual fidelity, consistent color hierarchy, and uniform interaction states across all citizen pages.
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">1. Brand &amp; UI Color Tokens</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-resq-card">
            <div className="h-12 rounded-lg bg-red-600 mb-2 shadow-sm" />
            <div className="text-xs font-semibold text-slate-900">Emergency Red</div>
            <div className="text-[10px] text-slate-500 font-mono">#DC2626 (Primary)</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-resq-card">
            <div className="h-12 rounded-lg bg-red-700 mb-2 shadow-sm" />
            <div className="text-xs font-semibold text-slate-900">Red Hover / Active</div>
            <div className="text-[10px] text-slate-500 font-mono">#B91C1C</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-resq-card">
            <div className="h-12 rounded-lg bg-[#111827] mb-2 shadow-sm" />
            <div className="text-xs font-semibold text-slate-900">Deep Navy Sidebar</div>
            <div className="text-[10px] text-slate-500 font-mono">#111827 (Sidebar)</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-resq-card">
            <div className="h-12 rounded-lg bg-slate-50 border border-slate-200 mb-2" />
            <div className="text-xs font-semibold text-slate-900">Surface Gray</div>
            <div className="text-[10px] text-slate-500 font-mono">#F8FAFC (Main BG)</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-resq-card">
            <div className="h-12 rounded-lg bg-amber-50 border border-amber-200 mb-2 flex items-center justify-center text-amber-700 font-bold text-xs">
              In Progress
            </div>
            <div className="text-xs font-semibold text-slate-900">Status: Progress</div>
            <div className="text-[10px] text-slate-500 font-mono">#FEF3C7 / #B45309</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-resq-card">
            <div className="h-12 rounded-lg bg-emerald-50 border border-emerald-200 mb-2 flex items-center justify-center text-emerald-700 font-bold text-xs">
              Resolved
            </div>
            <div className="text-xs font-semibold text-slate-900">Status: Resolved</div>
            <div className="text-[10px] text-slate-500 font-mono">#DCFCE7 / #15803D</div>
          </div>
        </div>
      </section>

      {/* 2. Button Variants */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">2. Button Component (`Button.jsx`)</h3>
        <Card>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Variants</h4>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary">Primary (Report Action)</Button>
                <Button variant="secondary">Secondary (White)</Button>
                <Button variant="outline">Outline (Red Border)</Button>
                <Button variant="danger">Danger Action</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="primary" disabled>Disabled State</Button>
                <Button variant="primary" isLoading>Submitting...</Button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Sizes &amp; Icons</h4>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm" icon={MapPin}>Small (Use My Location)</Button>
                <Button size="md" icon={ShieldAlert}>Medium Action</Button>
                <Button size="lg" icon={Send} iconPosition="right">Large Submit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Input Components */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">3. Form Input Component (`Input.jsx`)</h3>
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                required
                helperText="As printed on government issued identification"
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="Enter your password"
                required
              />

              <Input
                label="Search Incident Location"
                icon={Search}
                placeholder="Search for a location or use GPS"
                value={sampleInput}
                onChange={(e) => {
                  setSampleInput(e.target.value);
                  if (e.target.value.length > 0 && e.target.value.length < 3) {
                    setInputError('Location query must be at least 3 characters.');
                  } else {
                    setInputError('');
                  }
                }}
                error={inputError}
                helperText="Type 1-2 characters to test the validation error state."
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Badges */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">4. Status Badges (`Badge.jsx`)</h3>
        <Card>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge status="in-progress" showDot>In Progress</Badge>
              <Badge status="resolved" showDot>Resolved</Badge>
              <Badge status="reported" showDot>Reported</Badge>
              <Badge status="verified" showDot>Verified</Badge>
              <Badge status="assigned" showDot>Assigned</Badge>
              <Badge status="critical" showDot>Critical</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5. Alerts */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">5. System Feedback Alerts (`Alert.jsx`)</h3>
        <div className="space-y-3">
          <Alert variant="danger" title="Immediate Evacuation Warning" onClose={() => {}}>
            Heavy flooding reported near Scheme No. 54. Emergency rescue boats are dispatched. Avoid low-lying underpasses.
          </Alert>

          <Alert variant="success" title="Incident Successfully Reported" onClose={() => {}}>
            Your emergency report has been assigned reference #RSQ-8942 and transmitted to the nearest responder station.
          </Alert>

          <Alert variant="warning" title="Location Accuracy Alert">
            Browser GPS coordinates have an estimated precision of 45 meters. Please confirm physical landmarks.
          </Alert>

          <Alert variant="info" title="System Notice">
            ResQOne Citizen Frontend Milestone 2 is successfully configured.
          </Alert>
        </div>
      </section>

      {/* 6. Card Family & Modals */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">6. Card &amp; Modal Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverable>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Incident Card</CardTitle>
                <Badge status="in-progress">In Progress</Badge>
              </div>
              <CardDescription>Demonstrating CardHeader, CardTitle, and Badge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">Road Accident</h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> MG Road, Indore
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 2 hours ago
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between items-center w-full">
                <span className="text-xs text-slate-500 font-mono">ID: #98421</span>
                <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
                  Inspect Modal
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>State Primitives</CardTitle>
              <CardDescription>LoadingSpinner &amp; EmptyState</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoadingSpinner message="Querying active emergency dispatch centers..." />
              <EmptyState
                title="No Pending Reports"
                description="All your submitted emergencies have been verified and resolved."
                actionLabel="Submit New Report"
                onAction={() => alert('EmptyState Action Triggered')}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Accessible Interactive Modal Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Emergency Dispatch"
        description="Review the action details before transmitting to first responders."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm &amp; Transmit
            </Button>
          </>
        }
      >
        <p className="leading-relaxed">
          This accessible modal dialog traps focus, supports ESC keyboard dismissal, blocks body scroll, and offers responsive button actions.
        </p>
      </Modal>
    </div>
  );
}
