import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  Lock,
  Bell,
  Edit2,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import profileService from '../services/profileService';
import notificationService from '../services/notificationService';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Modals for Account Settings items matching mockup
  const [activeModal, setActiveModal] = useState(null); // 'password' | 'notifications' | 'privacy' | null

  useEffect(() => {
    async function loadProfile() {
      const pRes = await profileService.getProfile();
      setProfile(pRes.data);
      setFormData(pRes.data);
    }
    loadProfile();

    const unsubscribe = notificationService.subscribe((list) => {
      setRecentNotifications(list.slice(0, 3));
    });
    return () => unsubscribe();
  }, []);

  if (!profile) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading citizen profile...</p>
      </div>
    );
  }

  // Handle Form Input Changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
    const errKey = `emergencyContact.${field}`;
    if (errors[errKey]) {
      setErrors((prev) => ({ ...prev, [errKey]: null }));
    }
  };

  // Client-Side Validation
  const validateForm = () => {
    const errs = {};

    // 1. Full Name
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters).';
    }

    // 2. Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    // 3. Mobile Number format
    const phoneDigits = (formData.phone || '').replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      errs.phone = 'Please provide a valid 10-digit mobile number.';
    }

    // 4. Address
    if (!formData.address || formData.address.trim().length < 5) {
      errs.address = 'Please provide your residential address or locality.';
    }

    // 5. Emergency Contact
    if (!formData.emergencyContact?.name || formData.emergencyContact.name.trim().length < 2) {
      errs['emergencyContact.name'] = 'Emergency contact person name is required.';
    }

    const emPhoneDigits = (formData.emergencyContact?.phone || '').replace(/\D/g, '');
    if (!emPhoneDigits || emPhoneDigits.length < 10) {
      errs['emergencyContact.phone'] = 'Emergency contact phone number must have at least 10 digits.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Edit Action
  const handleStartEdit = () => {
    setFormData({ ...profile });
    setErrors({});
    setSaveSuccessMsg('');
    setIsEditing(true);
  };

  // Handle Cancel Action (Restores saved in-page profile state)
  const handleCancelEdit = () => {
    setFormData({ ...profile });
    setErrors({});
    setIsEditing(false);
  };

  // Handle Save Action (Updates in-memory component/service state with transparent disclaimer)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = await profileService.updateProfile(formData);
    setProfile(res.data);
    setIsEditing(false);
    setSaveSuccessMsg('Profile details updated in local session state.');
    setTimeout(() => setSaveSuccessMsg(''), 6000);
  };

  return (
    <div className="space-y-6 pb-12 antialiased text-slate-900">
      {/* Demo Mode Notice Banner */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Demo Profile:</strong> Displaying sample citizen profile records for Rohan Singh. Form edits update local component state only and will not persist across full page reloads until backend citizen profile API integration is completed.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] uppercase font-bold">
          Temporary Session State
        </span>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccessMsg && (
        <Alert
          variant="success"
          title="Changes Saved (Temporary Demo Interaction)"
          onClose={() => setSaveSuccessMsg('')}
        >
          {saveSuccessMsg} Note: Real database synchronization requires backend citizen profile API endpoints.
        </Alert>
      )}

      {/* Main Grid: Left Column (Profile Card & Account Settings) & Right Column (Profile Information Form & Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            LEFT COLUMN (5 cols on lg): Profile Card + Account Settings
           ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Citizen Profile Summary Card (Strictly matching reference mockup) */}
          <Card className="shadow-resq-card text-center p-6 sm:p-7">
            {/* Avatar with RS initials or image */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white ring-4 ring-slate-100">
              <span>RS</span>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white" title="Verified Citizen">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="mt-4 space-y-1">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {profile.fullName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {profile.email}
              </p>
              <p className="text-xs text-slate-500 font-medium font-mono">
                {profile.phone}
              </p>
            </div>

            {/* Citizen Status Badge */}
            <div className="mt-3">
              <Badge variant="verified" size="sm" showDot>
                {profile.role}
              </Badge>
            </div>

            {/* Edit Profile Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit2}
                  onClick={handleStartEdit}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={X}
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Check}
                    onClick={handleSaveProfile}
                    className="flex-1"
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* 2. Account Settings Card (Strictly matching reference mockup) */}
          <Card className="shadow-resq-card">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">
                Account Settings
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-slate-100">
              
              {/* Option 1: Change Password */}
              <button
                type="button"
                onClick={() => setActiveModal('password')}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Change Password</div>
                    <div className="text-[11px] text-slate-500">Update your account login security</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Option 2: Notification Preferences */}
              <button
                type="button"
                onClick={() => setActiveModal('notifications')}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Notification Preferences</div>
                    <div className="text-[11px] text-slate-500">Configure emergency alerts & updates</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Option 3: Privacy Settings */}
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Privacy Settings</div>
                    <div className="text-[11px] text-slate-500">Manage location telemetry permissions</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </button>

            </div>
          </Card>

        </div>

        {/* =========================================================================
            RIGHT COLUMN (7 cols on lg): Personal Information & Emergency Contact
           ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* Personal Information & Emergency Contact Form Card */}
          <Card className="shadow-resq-card">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Essential citizen details utilized during emergency response.
                </CardDescription>
              </div>
              {isEditing && (
                <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Editing Mode
                </span>
              )}
            </CardHeader>

            <CardContent className="pt-5">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* Full Name */}
                <Input
                  label="Full Name"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={!isEditing}
                  required={isEditing}
                  error={errors.fullName}
                  icon={User}
                  placeholder="Enter full name"
                />

                {/* Email Address & Mobile Number in 2 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    required={isEditing}
                    error={errors.email}
                    icon={Mail}
                    placeholder="you@example.com"
                  />

                  <Input
                    label="Mobile Number"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    required={isEditing}
                    error={errors.phone}
                    icon={Phone}
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Residential Address / Locality */}
                <Input
                  label="Residential Address / Locality"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  required={isEditing}
                  error={errors.address}
                  icon={MapPin}
                  placeholder="Street, area, city, pincode"
                />

                {/* Blood Group */}
                <div>
                  <label htmlFor="bloodGroup" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Blood Group (Optional for Medical Dispatch)
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Heart className="w-4 h-4 text-red-500" />
                    </div>
                    {isEditing ? (
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup || 'O+'}
                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                        className="block w-full rounded-lg text-sm text-slate-900 bg-white border border-slate-300 pl-9 pr-3.5 py-2.5 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
                      >
                        <option value="A+">A+ (A Positive)</option>
                        <option value="A-">A- (A Negative)</option>
                        <option value="B+">B+ (B Positive)</option>
                        <option value="B-">B- (B Negative)</option>
                        <option value="AB+">AB+ (AB Positive)</option>
                        <option value="AB-">AB- (AB Negative)</option>
                        <option value="O+">O+ (O Positive)</option>
                        <option value="O-">O- (O Negative)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value={formData.bloodGroup || 'O+'}
                        className="block w-full rounded-lg text-sm text-slate-900 bg-slate-50 border border-slate-300 pl-9 pr-3.5 py-2.5 cursor-not-allowed"
                      />
                    )}
                  </div>
                </div>

                {/* Emergency Contact Sub-section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Emergency Contact (Next of Kin)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Notified immediately by ResQOne in case of critical medical or distress reports.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Person Name"
                      id="emName"
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                      disabled={!isEditing}
                      required={isEditing}
                      error={errors['emergencyContact.name']}
                      placeholder="e.g. Priya Singh (Spouse)"
                    />

                    <Input
                      label="Emergency Contact Phone"
                      id="emPhone"
                      value={formData.emergencyContact?.phone || ''}
                      onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                      disabled={!isEditing}
                      required={isEditing}
                      error={errors['emergencyContact.phone']}
                      placeholder="+91 98765 12345"
                    />
                  </div>
                </div>

                {/* Edit Mode Save / Cancel Buttons */}
                {isEditing && (
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={Check}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}

              </form>
            </CardContent>
          </Card>

          {/* Quick Notifications Link Card (Matches mockup right-side Notifications preview) */}
          <Card className="shadow-resq-card">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Recent Notifications
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Real-time alerts and incident status updates.
                </CardDescription>
              </div>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <div className="divide-y divide-slate-100">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">
                      {notif.incidentType ? `${notif.incidentType} • ${notif.timestamp}` : notif.message}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                    {notif.relativeTime}
                  </span>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* =========================================================================
          MODALS FOR ACCOUNT SETTINGS
         ========================================================================= */}

      {/* 1. Change Password Modal */}
      <Modal
        isOpen={activeModal === 'password'}
        onClose={() => setActiveModal(null)}
        title="Change Password"
        description="Update your account credentials to keep your profile secure."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveModal(null);
                setSaveSuccessMsg('Password change request acknowledged (demo action).');
                setTimeout(() => setSaveSuccessMsg(''), 5000);
              }}
            >
              Update Password
            </Button>
          </>
        }
      >
        <div className="space-y-3.5 text-xs">
          <div className="bg-sky-50 border border-sky-200 text-sky-800 p-2.5 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <span>Note: Password changes require backend authentication service integration.</span>
          </div>
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            disabled
            value="••••••••••••"
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new strong password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
          />
        </div>
      </Modal>

      {/* 2. Notification Preferences Modal */}
      <Modal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        title="Notification Preferences"
        description="Configure which emergency alerts and dispatch notifications you receive."
        footer={
          <Button variant="primary" size="sm" onClick={() => setActiveModal(null)}>
            Save Preferences
          </Button>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="font-semibold text-slate-900">Emergency Dispatch SMS</div>
              <div className="text-slate-500 text-[11px]">Receive live SMS when responders are deployed</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-600 w-4 h-4" />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="font-semibold text-slate-900">Weather & Severe Safety Advisories</div>
              <div className="text-slate-500 text-[11px]">Instant flash flood and heavy rain warnings</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-600 w-4 h-4" />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="font-semibold text-slate-900">Incident Resolution Emails</div>
              <div className="text-slate-500 text-[11px]">Detailed debrief upon emergency resolution</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-600 w-4 h-4" />
          </div>
        </div>
      </Modal>

      {/* 3. Privacy Settings Modal */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy & Telemetry Settings"
        description="Manage geolocation access and data sharing with emergency command hubs."
        footer={
          <Button variant="primary" size="sm" onClick={() => setActiveModal(null)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <h5 className="font-semibold text-slate-900 mb-1">GPS Telemetry Routing</h5>
            <p className="text-[11px] leading-relaxed">
              Your precise coordinates are transmitted to first responders strictly during active incident dispatches. ResQOne does not track or store continuous background location.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <h5 className="font-semibold text-slate-900 mb-1">Data Retention</h5>
            <p className="text-[11px] leading-relaxed">
              All incident logs and uploaded evidence are handled under citizen safety privacy regulations and retained solely for official emergency debriefs.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
}
