import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import authRescueImg from '../assets/auth_rescue.jpg';
import authService from '../services/authService';

export default function RegisterPage() {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Submission States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Client-Side Validation
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Indian mobile numbers: 10 digits starting with 6-9, with optional +91 or 0
    const mobileRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Please enter at least 3 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!mobileRegex.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must include both letters and numbers.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionNotice(null);

    if (!validate()) return;

    setIsSubmitting(true);
    // Call services layer
    const result = await authService.register(formData);
    setIsSubmitting(false);

    // Honest status notice: Client validated, backend integration pending
    setSubmissionNotice({
      type: 'info',
      title: 'Registration Validation Passed (Backend Integration Pending)',
      message:
        'Your registration details meet all client specifications. The backend database and user creation endpoint will be integrated once deployed by Team Member 2.',
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row antialiased text-slate-900">
      {/* =========================================================================
          LEFT PANEL: Dark Navy Photographic Panel (Strictly matching mockup)
         ========================================================================= */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0b1329] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={authRescueImg}
            alt="ResQOne First Responders on Scene"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091124] via-[#0b1329]/80 to-[#0b1329]/95" />
        </div>

        {/* Top Header on Image Panel (Matching mockup text: "Join ResQOne - Be a part of a safer, stronger community.") */}
        <div className="relative z-10 space-y-3">
          <Logo variant="dark" size="lg" to="/" />
          <div className="pt-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Join ResQOne
            </h2>
            <p className="text-sm text-slate-300 font-medium max-w-xs mt-1 leading-relaxed">
              Be a part of a safer, stronger community.
            </p>
          </div>
        </div>

        {/* Bottom Feature Pill on Image Panel */}
        <div className="relative z-10 pt-16">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
            <div className="flex items-center space-x-2 text-red-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Citizen Network</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Receive verified emergency alerts, report local hazards, and coordinate with municipal first responders in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Clean White Registration Form (Matching mockup)
         ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Mobile-only brand header */}
        <div className="lg:hidden flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
          <Logo variant="light" size="md" to="/" />
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-red-600">
            &larr; Back to Home
          </Link>
        </div>

        <div className="max-w-[420px] w-full mx-auto my-auto py-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-950 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign up to start reporting and staying informed
            </p>
          </div>

          {/* Submission Notice / Backend Integration Alert */}
          {submissionNotice && (
            <div className="mb-5 space-y-3">
              <Alert variant="info" title={submissionNotice.title}>
                <p>{submissionNotice.message}</p>
                <div className="mt-3 pt-2 border-t border-sky-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-sky-800 font-medium">Ready to test?</span>
                  <Link to="/dashboard">
                    <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right">
                      Enter Citizen Dashboard
                    </Button>
                  </Link>
                </div>
              </Alert>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              icon={User}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />

            {/* Email */}
            <Input
              label="Email"
              name="email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            {/* Mobile Number */}
            <Input
              label="Mobile Number"
              name="mobileNumber"
              type="tel"
              icon={Phone}
              placeholder="+91 98765 43210"
              value={formData.mobileNumber}
              onChange={handleChange}
              error={errors.mobileNumber}
              helperText="Format: 10-digit number (e.g., 9876543210 or +91 9876543210)"
              required
            />

            {/* Password */}
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText="At least 8 characters with letters &amp; numbers"
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Terms Notice */}
            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              By creating an account, you agree to ResQOne&apos;s Community Guidelines and acknowledge that emergency reporting carries civic responsibility.
            </p>

            {/* Primary Action Button (Solid Emergency Red matching mockup) */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                className="shadow-sm"
              >
                Sign Up
              </Button>
            </div>
          </form>

          {/* Login Redirect Link */}
          <div className="mt-8 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Footer info notice */}
        <div className="text-center pt-6 text-[11px] text-slate-400">
          ResQOne Citizen Emergency Management &bull; Capstone Project
        </div>
      </div>
    </div>
  );
}
