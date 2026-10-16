import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Smartphone,
  Info,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import authRescueImg from '../assets/auth_rescue.jpg';
import authService from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Submission States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState(null);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');

  // Client Validation
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g., citizen@example.com).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
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
    const result = await authService.login({ email, password, rememberMe });
    setIsSubmitting(false);

    // Honest status presentation: Client validated, backend pending
    setSubmissionNotice({
      type: 'info',
      title: 'Client Validation Passed (Backend Integration Pending)',
      message:
        'The backend authentication service is being developed by our backend team member. To inspect the citizen dashboard shell in demo mode, click the preview link below.',
    });
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotStatus('Please enter a valid registered email address.');
      return;
    }
    setForgotStatus('Password recovery request recorded. Backend notification gateway integration pending.');
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

        {/* Top Header on Image Panel */}
        <div className="relative z-10 space-y-3">
          <Logo variant="dark" size="lg" to="/" />
          <div className="pt-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Faster Response.
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              Safer Communities.
            </p>
          </div>
        </div>

        {/* Bottom Quote (Matching mockup text exactly) */}
        <div className="relative z-10 pt-16">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <blockquote className="text-sm italic font-light text-slate-200 leading-relaxed">
              &ldquo;In an emergency, every minute counts.&rdquo;
            </blockquote>
            <p className="text-[11px] text-red-400 font-semibold tracking-wide uppercase mt-2">
              ResQOne Citizen Dispatch Protocol
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Clean White Form (Strictly matching mockup)
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
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Login to your account to continue
            </p>
          </div>

          {/* Submission Notice / Backend Integration Alert */}
          {submissionNotice && (
            <div className="mb-5 space-y-3">
              <Alert variant="info" title={submissionNotice.title}>
                <p>{submissionNotice.message}</p>
                <div className="mt-3 pt-2 border-t border-sky-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-sky-800 font-medium">Ready to explore?</span>
                  <Link to="/dashboard">
                    <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right">
                      Enter Citizen Dashboard
                    </Button>
                  </Link>
                </div>
              </Alert>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <Input
              label="Email"
              name="email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              error={errors.email}
              required
            />

            {/* Password Field */}
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              error={errors.password}
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

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-600 focus:ring-offset-0"
                />
                <span className="text-slate-600 font-medium">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotPasswordModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
              >
                Forgot password?
              </button>
            </div>

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
                Login
              </Button>
            </div>
          </form>

          {/* Social / Alternative Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-500 font-medium">
                or continue with
              </span>
            </div>
          </div>

          {/* Alternative Auth Buttons (Matching mockup design) */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => alert('Google authentication requires OAuth client credentials from the backend configuration.')}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {/* Google G icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Mobile OTP authentication will be enabled once SMS gateway credentials are provided.')}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Continue with Mobile Number</span>
            </button>
          </div>

          {/* Registration Redirect Link */}
          <div className="mt-8 text-center text-xs text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer info notice */}
        <div className="text-center pt-6 text-[11px] text-slate-400">
          ResQOne Citizen Emergency Management &bull; Capstone Project
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      <Modal
        isOpen={forgotPasswordModalOpen}
        onClose={() => {
          setForgotPasswordModalOpen(false);
          setForgotStatus('');
        }}
        title="Reset Account Password"
        description="Enter your registered email address to receive password recovery instructions."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setForgotPasswordModalOpen(false);
                setForgotStatus('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleForgotPasswordSubmit}>
              Send Recovery Link
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Registered Email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
          {forgotStatus && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
              {forgotStatus}
            </p>
          )}
          <p className="text-[11px] text-slate-500">
            Note: Live password recovery emails will be dispatched by the backend SMTP service once fully deployed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
