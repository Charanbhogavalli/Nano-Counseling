'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CSVImporter } from '@/components/CSVImporter';
import { dbService } from '@/lib/supabase';
import { Shield, Database, Users, CreditCard, BarChart2, ShieldAlert, Edit2, Check } from 'lucide-react';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    collegesCount: 0,
    cutoffsCount: 0,
    usersCount: 0,
    paymentsSum: 0
  });

  const [collegesList, setCollegesList] = useState<any[]>([]);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [editRanking, setEditRanking] = useState('');
  const [editRating, setEditRating] = useState('');

  const loadStats = async () => {
    try {
      const u = await dbService.getCurrentUser();
      if (u && u.role === 'admin') {
        setIsAdmin(true);

        const colleges = await dbService.getColleges();
        const cutoffs = await dbService.getCutoffs();
        
        // Mock user stats
        setStats({
          collegesCount: colleges.length,
          cutoffsCount: cutoffs.length,
          usersCount: 142,
          paymentsSum: 9 * 42 // ₹378
        });

        setCollegesList(colleges.slice(0, 5)); // show first 5 colleges for editing
      } else {
        setIsAdmin(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleUpdateCollege = async (clg: any) => {
    const updated = {
      ...clg,
      ranking: Number(editRanking) || clg.ranking,
      rating: Number(editRating) || clg.rating
    };

    const success = await dbService.updateCollege(updated);
    if (success) {
      alert("College details updated successfully in PostgreSQL!");
      setEditingCollege(null);
      loadStats();
    }
  };

  const promoteSession = async () => {
    await dbService.simulateLogin('admin@counsel.com', 'admin');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-dark justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-neon-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-dark justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <Card hoverEffect={false} className="max-w-md w-full border border-white/5 bg-brand-dark/60 p-8 text-center space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-risky-red/10 border border-risky-red/20 text-risky-red">
              <ShieldAlert size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Unauthorized Access</h3>
              <p className="text-xs text-slate-400">
                You are currently logged in with Student privileges. This control panel requires system Administrator credentials.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="glow" onClick={promoteSession} className="w-full justify-center text-xs font-semibold py-2.5">
                Elevate session to Administrator
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-neon-blue/5 blur-[100px] pointer-events-none" />

        <div className="space-y-8 relative">
          
          {/* Admin Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center">
              <Shield className="mr-2.5 text-neon-purple" size={24} />
              Control Room & Ingestion Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload datasets, change institution profiles, and analyze counseling parameters.
            </p>
          </div>

          {/* Stats Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hoverEffect={false} className="border border-white/5 p-6 flex items-center space-x-4">
              <div className="p-3.5 bg-neon-blue/10 border border-neon-blue/20 rounded-xl text-neon-blue">
                <Database size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Active campuses</div>
                <div className="text-xl font-bold text-white mt-0.5">{stats.collegesCount} listed</div>
              </div>
            </Card>

            <Card hoverEffect={false} className="border border-white/5 p-6 flex items-center space-x-4">
              <div className="p-3.5 bg-neon-purple/10 border border-neon-purple/20 rounded-xl text-neon-purple">
                <Database size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Cutoff Ranks Matrix</div>
                <div className="text-xl font-bold text-white mt-0.5">{stats.cutoffsCount} rows</div>
              </div>
            </Card>

            <Card hoverEffect={false} className="border border-white/5 p-6 flex items-center space-x-4">
              <div className="p-3.5 bg-neon-green/10 border border-neon-green/20 rounded-xl text-neon-green">
                <Users size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Registered Students</div>
                <div className="text-xl font-bold text-white mt-0.5">{stats.usersCount} users</div>
              </div>
            </Card>

            <Card hoverEffect={false} className="border border-white/5 p-6 flex items-center space-x-4">
              <div className="p-3.5 bg-neon-pink/10 border border-neon-pink/20 rounded-xl text-neon-pink">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total Sales Invoiced</div>
                <div className="text-xl font-bold text-white mt-0.5">₹{stats.paymentsSum}</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* CSV upload system pipeline */}
            <div className="lg:col-span-6">
              <CSVImporter />
            </div>

            {/* Quick College editor database list */}
            <div className="lg:col-span-6">
              <Card hoverEffect={false} className="border border-white/5 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center">
                    <BarChart2 size={16} className="mr-2 text-neon-blue" />
                    Manage College Registry
                  </h3>
                </div>

                <div className="space-y-4">
                  {collegesList.map((clg) => (
                    <div key={clg.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white">{clg.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Code: {clg.code} • NIRF Ranking: #{clg.ranking}</div>
                        </div>

                        {editingCollege?.id !== clg.id ? (
                          <button
                            onClick={() => {
                              setEditingCollege(clg);
                              setEditRanking(String(clg.ranking));
                              setEditRating(String(clg.rating));
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateCollege(clg)}
                            className="p-1 rounded bg-safe-green/20 text-safe-green cursor-pointer"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>

                      {/* Editing fields */}
                      {editingCollege?.id === clg.id && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                          <div className="space-y-1">
                            <label className="text-slate-400">NIRF Ranking</label>
                            <input
                              type="number"
                              value={editRanking}
                              onChange={(e) => setEditRanking(e.target.value)}
                              className="w-full bg-brand-dark/80 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400">Platform Rating</label>
                            <input
                              type="text"
                              value={editRating}
                              onChange={(e) => setEditRating(e.target.value)}
                              className="w-full bg-brand-dark/80 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
