'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Shield, User, LogOut, Menu, X, Check } from 'lucide-react';
import { dbService, UserSession } from '@/lib/supabase';
import { Badge } from './ui/Badge';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchUser = async () => {
    try {
      const u = await dbService.getCurrentUser();
      setUserProfile(u);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUser();
    // Watch for payment completion updates in localStorage
    const interval = setInterval(() => {
      const localUser = localStorage.getItem('counsel_session');
      if (localUser) {
        setUserProfile(JSON.parse(localUser));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const switchRole = async (email: string, role: 'student' | 'admin') => {
    const profile = await dbService.simulateLogin(email, role);
    setUserProfile(profile);
    setShowDropdown(false);
    // Reload to refresh active states
    window.location.reload();
  };

  const handleLogout = async () => {
    await dbService.logout();
    setUserProfile(null);
    setShowDropdown(false);
    window.location.reload();
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Rank Predictor', href: '/predictor' },
    { name: 'Search Colleges', href: '/search' },
    { name: 'Dashboard', href: '/dashboard' },
  ];



  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-brand-dark/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-white">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-blue"></span>
              </span>
              <span className="bg-gradient-to-r from-white via-slate-200 to-neon-blue bg-clip-text text-transparent">
                Nano
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 font-mono tracking-widest uppercase">
                Counseling
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isLinkActive(link.href)
                    ? 'bg-white/5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-t border-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {userProfile && (
              <div className="flex items-center space-x-2 mr-1">
                <Badge variant="premium">Full Access</Badge>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <User size={16} />
                <span className="max-w-[120px] truncate">
                  {userProfile ? userProfile.full_name : 'Guest Account'}
                </span>
              </button>

              {/* Account Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-white/10 bg-brand-dark/95 backdrop-blur-2xl p-3 shadow-2xl focus:outline-none">
                  <div className="px-2 py-1.5 border-b border-white/5 mb-2">
                    <p className="text-xs font-semibold text-white">{userProfile ? userProfile.full_name : 'Guest User'}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{userProfile?.email || 'guest@nanocounsel.com'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex w-full items-center rounded-lg px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-white/5 transition-all"
                    >
                      <User size={12} className="mr-2" />
                      <span>My Profile Dashboard</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center space-x-2 rounded-lg px-2 py-1.5 text-left text-xs text-risky-red hover:bg-risky-red/5 transition-all cursor-pointer"
                    >
                      <LogOut size={12} className="mr-2" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            {userProfile?.is_premium && <Badge variant="premium">Premium</Badge>}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none transition-all cursor-pointer"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-brand-dark/95 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-3 py-2 text-base font-medium transition-all ${
                isLinkActive(link.href)
                  ? 'bg-white/5 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {userProfile && (
            <div className="border-t border-white/5 mt-3 pt-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-sm text-risky-red hover:bg-risky-red/5 transition-all cursor-pointer"
              >
                <LogOut size={14} className="mr-2" />
                <span>Sign Out ({userProfile.full_name})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
