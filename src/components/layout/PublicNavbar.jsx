import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Contact', path: '/#contact' },
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path.includes('#')) {
      const id = path.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Logo variant="light" size="md" to="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path && !location.hash;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    isActive ? 'text-red-600' : 'text-slate-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" fullWidth size="md">
                Login
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" fullWidth size="md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
