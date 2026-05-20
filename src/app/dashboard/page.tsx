'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PaywallModal } from '@/components/PaywallModal';
import { dbService } from '@/lib/supabase';
import { User, Clock, ArrowUpDown, ChevronRight, Lock, Trash2, Award } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(true);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const [choices, setChoices] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const u = await dbService.getCurrentUser();
      setUserProfile(u);
      setIsPremium(u.is_premium);

      const hist = await dbService.getPredictionHistory(u.id);
      setHistory(hist);

      // Construct a mock preference choice list from history matching
      if (hist.length > 0) {
        // Flatten top choices
        const rawChoices = hist
          .map((h: any) => h.results || [])
          .flat()
          .slice(0, 8); // top 8 choices
        
        setChoices(rawChoices);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      const localUser = localStorage.getItem('counsel_session');
      if (localUser) {
        const u = JSON.parse(localUser);
        setUserProfile(u);
        setIsPremium(u.is_premium);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!isPremium) {
      setIsPaywallOpen(true);
      return;
    }
    const newChoices = [...choices];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= newChoices.length) return;

    // Swap
    const temp = newChoices[index];
    newChoices[index] = newChoices[targetIdx];
    newChoices[targetIdx] = temp;
    setChoices(newChoices);
  };

  const deleteItem = (index: number) => {
    const newChoices = choices.filter((_, idx) => idx !== index);
    setChoices(newChoices);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full bg-neon-pink/5 blur-[100px] pointer-events-none" />

        <div className="space-y-8 relative">
          
          {/* Dashboard Profile Header */}
          <Card hoverEffect={false} className="border border-white/5 bg-brand-dark/40 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{userProfile ? userProfile.full_name : 'Engineering Aspirant'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{userProfile?.email}</p>
              </div>
            </div>

            <div className="flex space-x-3 w-full md:w-auto">
              <Badge variant="premium" className="px-4 py-2">Full Unrestricted Access</Badge>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Preference order sequence builder */}
            <div className="lg:col-span-8 space-y-6">
              <Card hoverEffect={false} className="border border-white/5 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center">
                    <ArrowUpDown size={16} className="mr-2 text-neon-blue" />
                    Counseling Preference Entry Sequence Builder
                  </h3>
                </div>

                {/* Preference items list */}
                <div className="space-y-3">
                  {choices.length > 0 ? (
                    choices.map((choice, index) => {
                      const isLocked = !isPremium && index >= 3;

                      return (
                        <div
                          key={choice.cutoffId}
                          className={`p-4 border rounded-2xl flex items-center justify-between transition-all text-xs relative ${
                            isLocked 
                              ? 'border-white/5 bg-white/[0.01] opacity-50 blur-[1px]' 
                              : 'border-white/5 bg-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="h-6 w-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-slate-400 font-bold shrink-0">
                              {index + 1}
                            </span>
                            
                            <div>
                              <div className="font-semibold text-white">
                                {isLocked ? '•••••••• College of Engineering' : choice.college.name}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Course: <strong className="text-neon-blue">{isLocked ? '•••' : choice.branch}</strong> • Category: {choice.category}
                              </div>
                            </div>
                          </div>

                          {/* Rearrange Action buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              disabled={index === 0 || isLocked}
                              onClick={() => moveItem(index, 'up')}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              ▲
                            </button>
                            <button
                              disabled={index === choices.length - 1 || isLocked}
                              onClick={() => moveItem(index, 'down')}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => deleteItem(index)}
                              className="p-1 rounded bg-risky-red/5 hover:bg-risky-red/10 text-risky-red cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-slate-500">
                      <p>Your preference list is empty.</p>
                      <p className="text-[10px] text-slate-600 mt-1">Run predictions first to populate choices.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Prediction Reports Run History */}
            <div className="lg:col-span-4 space-y-6">
              <Card hoverEffect={false} className="border border-white/5 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center border-b border-white/5 pb-3">
                  <Clock size={16} className="mr-2 text-neon-blue" />
                  Recent Prediction runs
                </h3>

                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((hist) => (
                      <div key={hist.id} className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{hist.exam} Predictor</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(hist.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 text-[10px] text-slate-400 font-mono">
                          <div>Rank: <span className="text-white">{hist.rank}</span></div>
                          <div>Category: <span className="text-white">{hist.category}</span></div>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Matched {hist.results?.length || 0} colleges</span>
                          <Link href="/predictor" className="text-neon-blue hover:underline flex items-center">
                            Re-run <ChevronRight size={10} className="ml-0.5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <p>No recent reports logged.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

          </div>
        </div>
      </main>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSuccess={loadData}
      />

      <Footer />
    </div>
  );
}
