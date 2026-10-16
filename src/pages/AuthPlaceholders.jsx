import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, UserPlus, ArrowLeft } from 'lucide-react';
import Card, { CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Logo variant="light" size="lg" to="/" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">Citizen Login</h2>
        <p className="mt-1 text-xs text-slate-500">Scheduled for Milestone 4 (Split-screen authentication)</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="space-y-4 text-center py-8">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-600">
              The full split-screen authentication matching the mockup will be implemented in <strong>Milestone 4</strong>.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/dashboard">
                <Button variant="primary" fullWidth>
                  Proceed to Citizen App Shell
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" fullWidth icon={ArrowLeft}>
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Logo variant="light" size="lg" to="/" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">Create Citizen Account</h2>
        <p className="mt-1 text-xs text-slate-500">Scheduled for Milestone 4</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="space-y-4 text-center py-8">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-600">
              Registration form with name, email, mobile number, and password validation will be built in <strong>Milestone 4</strong>.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login">
                <Button variant="outline" fullWidth>
                  Go to Login
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" fullWidth icon={ArrowLeft}>
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
