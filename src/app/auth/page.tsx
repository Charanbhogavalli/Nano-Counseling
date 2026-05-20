'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { dbService, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { LogIn, Sparkles, Mail, Lock, ShieldAlert } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const user = await dbService.getCurrentUser();
      if (user && user.email !== 'student@example.com') {
        router.push('/predictor');
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Real Supabase Authentication
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: 'Engineering Aspirant' }
            }
          });
          if (error) throw error;
          alert('Verification email sent! Please check your inbox.');
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          router.push('/predictor');
        }
      } else {
        // Fallback local session mock login
        const role = email.startsWith('admin') ? 'admin' : 'student';
        await dbService.simulateLogin(email, role);
        router.push('/predictor');
      }
    } catch (err: any) {
      console.error(err);
      alert('Authentication failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 relative">
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] rounded-full bg-neon-purple/5 blur-[100px] pointer-events-none" />

        <Card hoverEffect={false} className="max-w-md w-full border border-white/5 bg-brand-dark/60 p-8 space-y-6 relative glow-card-purple">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create your platform account' : 'Sign in to platform'}
            </h2>
            <p className="text-xs text-slate-400">
              Access the cutoff predictors, sequence builders and database statistics.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-400 flex items-start space-x-2">
              <ShieldAlert size={14} className="text-neon-blue shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Development Sandbox mode:</span> Real keys are not configured. Enter any email/password to simulate authentications. Use emails starting with <strong className="text-neon-blue">admin@</strong> to unlock admin roles.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-dark/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-blue transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Security Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-dark/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-blue transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 mt-2 text-xs font-semibold justify-center shadow-[0_0_15px_rgba(161,44,255,0.15)]"
              isLoading={loading}
            >
              <LogIn size={14} className="mr-2" />
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle option */}
          <div className="text-center text-[10px] text-slate-500 pt-2">
            <span>
              {isSignUp ? 'Already have an account? ' : 'First time here? '}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-neon-blue hover:underline font-semibold cursor-pointer"
            >
              {isSignUp ? 'Sign In instead' : 'Create an Account'}
            </button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
