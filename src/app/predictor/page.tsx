'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, SlidersHorizontal, Lock, ArrowUpDown, Info, RefreshCw, Download } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PaywallModal } from '@/components/PaywallModal';
import { dbService } from '@/lib/supabase';
import { generateCounselingOrder, PredictionResult } from '@/lib/predictor-engine';

export default function PredictorPage() {
  const [exam, setExam] = useState<'JEE Main' | 'COMEDK' | 'KCET' | 'AP-EAMCET' | 'TS-EAMCET'>('COMEDK');
  const [rank, setRank] = useState<string>('2500');
  const [category, setCategory] = useState<string>('General');
  const [preferredBranch, setPreferredBranch] = useState<string>('All');
  const [preferredLocation, setPreferredLocation] = useState<string>('All');
  const [budget, setBudget] = useState<string>('');
  const [gender, setGender] = useState<string>('Co-Ed');
  const [collegeType, setCollegeType] = useState<string>('All');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isPremium, setIsPremium] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [isRelaxed, setIsRelaxed] = useState(false);
  const [relaxedReason, setRelaxedReason] = useState<string>('');
  
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [isOptimizedOrder, setIsOptimizedOrder] = useState(false);
  
  // Advanced recommendation system features
  const [compareList, setCompareList] = useState<PredictionResult[]>([]);

  const toggleCompare = (choice: PredictionResult) => {
    if (compareList.find(c => c.cutoffId === choice.cutoffId)) {
      setCompareList(compareList.filter(c => c.cutoffId !== choice.cutoffId));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare a maximum of 3 colleges at once.");
        return;
      }
      setCompareList([...compareList, choice]);
    }
  };

  const downloadCounselingCSV = () => {
    const active = getActiveResults();
    if (active.length === 0) return;
    
    // CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Choice Order,College Code,College Name,Branch,Quota,Year,Expected Closing Cutoff,Chance %,Category,Tuition Fees\n";
    
    active.forEach((choice, index) => {
      const row = [
        index + 1,
        `"${choice.college.code}"`,
        `"${choice.college.name}"`,
        `"${choice.branch}"`,
        `"${choice.college.type}"`,
        choice.year,
        choice.expectedClosingRank,
        `${choice.probability}%`,
        choice.status,
        choice.fees
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `counseling_order_${exam}_rank_${rank}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic Categories based on selected Exam
  const examCategories = {
    'JEE Main': ['General', 'OBC-NCL', 'SC', 'ST'],
    'KCET': ['GM', '2A', '3A', 'SC', 'ST'],
    'COMEDK': ['General', 'OBC', 'SC', 'ST'],
    'AP-EAMCET': ['General', 'OBC', 'SC', 'ST'],
    'TS-EAMCET': ['General', 'OBC', 'SC', 'ST'],
  };

  useEffect(() => {
    // Set default category when exam changes
    const cats = examCategories[exam];
    if (!cats.includes(category)) {
      setCategory(cats[0]);
    }
  }, [exam]);

  const getTopChoiceTags = (choice: PredictionResult, list: PredictionResult[]) => {
    const tags: string[] = [];
    if (choice.status === 'Safe') tags.push('🛡️ Safe Choice');
    const maxPlacement = Math.max(...list.map(c => c.college.placements_info?.median_ctc_lpa || 0));
    if (maxPlacement > 0 && choice.college.placements_info?.median_ctc_lpa === maxPlacement) {
      tags.push(`🏆 Top Placements (${maxPlacement} LPA)`);
    }
    const fees = choice.fees || choice.college.fees_median;
    const minFees = Math.min(...list.map(c => c.fees || c.college.fees_median || Infinity));
    if (fees > 0 && fees === minFees) {
      tags.push('💰 Most Affordable');
    }
    if (tags.length === 0) tags.push('⭐ High Match');
    return tags;
  };

  const loadProfile = async () => {
    const u = await dbService.getCurrentUser();
    setUserProfile(u);
    setIsPremium(u.is_premium);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank || Number(rank) <= 0) {
      alert("Please enter a valid rank.");
      return;
    }

    setLoading(true);
    setIsOptimizedOrder(false); // reset order toggle
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam,
          rank: Number(rank),
          category,
          gender,
          preferredBranch,
          preferredLocation,
          budget: budget ? Number(budget) : undefined,
          collegeType,
          userEmail: userProfile?.email || 'student@counsel.com'
        })
      });

      if (!res.ok) throw new Error('API failure');
      const data = await res.json();
      
      setResults(data.predictions);
      setTotalCount(data.totalCount);
      setIsPremium(data.isPremium);
      setIsRelaxed(data.isRelaxed || false);
      setRelaxedReason(data.relaxedReason || '');
      setHasPredicted(true);
    } catch (err: any) {
      console.error(err);
      alert("Prediction process encountered errors: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSequence = () => {
    if (!isPremium) {
      setIsPaywallOpen(true);
      return;
    }
    setIsOptimizedOrder(!isOptimizedOrder);
  };

  const getActiveResults = () => {
    if (isOptimizedOrder && isPremium) {
      return generateCounselingOrder(results);
    }
    return results;
  };

  const safeCount = results.filter(r => r.status === 'Safe').length;
  const moderateCount = results.filter(r => r.status === 'Moderate').length;
  const dreamCount = results.filter(r => r.status === 'Dream').length;
  const totalDistribution = results.length || 1;

  const safePct = Math.round((safeCount / totalDistribution) * 100);
  const moderatePct = Math.round((moderateCount / totalDistribution) * 100);
  const dreamPct = Math.round((dreamCount / totalDistribution) * 100);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-neon-purple/5 blur-[100px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] rounded-full bg-neon-blue/5 blur-[100px] pointer-events-none" />

        <div className="space-y-8 relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white flex items-center">
                <Sparkles className="mr-2.5 text-neon-blue animate-pulse" size={24} />
                Admission Predictor Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter your details to inspect realistic engineering outcomes and choices.
              </p>
            </div>

            {/* Free Status Indicator */}
            {userProfile && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center space-x-2 text-xs">
                <Sparkles size={14} className="text-white" />
                <span className="text-slate-300 font-semibold">Nano Counseling • Free Unlimited Edition</span>
              </div>
            )}
          </div>

          {/* Form and Results Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Input Form Panel */}
            <div className="lg:col-span-4 space-y-6">
              <Card hoverEffect={false} className="border border-white/5 bg-brand-dark/40 sticky top-24">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <h3 className="text-sm font-semibold text-white">Parameters Config</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-xs text-slate-400 hover:text-white flex items-center"
                  >
                    <SlidersHorizontal size={12} className="mr-1" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                <form onSubmit={handlePredict} className="space-y-4 text-xs">
                  {/* Exam selection */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-medium">Entrance Exam Type</label>
                    <select
                      value={exam}
                      onChange={(e: any) => setExam(e.target.value)}
                      className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all"
                    >
                      <option value="COMEDK">COMEDK (Karnataka Private)</option>
                      <option value="KCET">KCET (Karnataka Govt)</option>
                      <option value="JEE Main">JEE Main (NITs/IIITs)</option>
                      <option value="AP-EAMCET">AP-EAMCET (Andhra Pradesh)</option>
                      <option value="TS-EAMCET">TS-EAMCET (Telangana)</option>
                    </select>
                  </div>

                  {/* Rank & Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-medium">Your Rank</label>
                      <input
                        type="number"
                        required
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-medium">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all"
                      >
                        {examCategories[exam].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Extended Filters */}
                  {showFilters && (
                    <div className="space-y-4 pt-2 border-t border-white/5 animate-fadeIn">
                      {/* Branch Choice */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-medium">Preferred Engineering Branch</label>
                        <select
                          value={preferredBranch}
                          onChange={(e) => setPreferredBranch(e.target.value)}
                          className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all"
                        >
                          <option value="All">All Branches / Combined</option>
                          <option value="CSE">Computer Science (CSE)</option>
                          <option value="AIML">AI & Machine Learning (AIML)</option>
                          <option value="ISE">Information Science (ISE)</option>
                          <option value="ECE">Electronics (ECE)</option>
                          <option value="ME">Mechanical (ME)</option>
                          <option value="CE">Civil (CE)</option>
                        </select>
                      </div>

                      {/* City/State */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-medium">Preferred Location</label>
                        <select
                          value={preferredLocation}
                          onChange={(e) => setPreferredLocation(e.target.value)}
                          className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all"
                        >
                          <option value="All">Any Location</option>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Vijayawada">Vijayawada</option>
                          <option value="Visakhapatnam">Visakhapatnam</option>
                          <option value="Karnataka">Karnataka State</option>
                          <option value="Telangana">Telangana State</option>
                          <option value="Andhra Pradesh">Andhra Pradesh State</option>
                        </select>
                      </div>

                      {/* Budget */}
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-medium">Max Annual Fee Budget (₹)</label>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="e.g. 250000"
                          className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all font-mono"
                        />
                      </div>

                      {/* Gender and College Type */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-slate-400 font-medium">Gender Pool</label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all"
                          >
                            <option value="Co-Ed">Co-Ed</option>
                            <option value="Female Only">Female Only</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-slate-400 font-medium">College Type</label>
                          <select
                            value={collegeType}
                            onChange={(e) => setCollegeType(e.target.value)}
                            className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all"
                          >
                            <option value="All">All Types</option>
                            <option value="Government">Government</option>
                            <option value="Private">Private</option>
                            <option value="Autonomous">Autonomous</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 mt-4 text-xs font-semibold justify-center shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                    isLoading={loading}
                  >
                    Generate Predictions
                  </Button>
                </form>
              </Card>

              {/* Quick Testing Warning Note */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-white flex items-center">
                  <Info size={12} className="mr-1 text-neon-blue" />
                  Testing Tip:
                </div>
                <p>
                  Use the Profile Switcher in the top right navbar to instantly toggle between **Free**, **Premium**, or **Admin** accounts to evaluate paywall states!
                </p>
              </div>
            </div>

            {/* Predictions Result List */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Distribution & Portfolio Analytics Panel */}
              {results.length > 0 && (
                <Card hoverEffect={false} className="border border-white/5 bg-brand-dark/20 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Recommendation Portfolio Distribution</span>
                    <span className="text-slate-300 font-bold">{results.length} Matches Found</span>
                  </div>
                  
                  {/* Stacked Portfolio Bar */}
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-neon-purple shadow-[0_0_10px_rgba(161,44,255,0.4)] transition-all" 
                      style={{ width: `${dreamPct}%` }}
                      title={`Dream: ${dreamPct}%`}
                    />
                    <div 
                      className="h-full bg-moderate-yellow shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-all" 
                      style={{ width: `${moderatePct}%` }}
                      title={`Moderate: ${moderatePct}%`}
                    />
                    <div 
                      className="h-full bg-safe-green shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all" 
                      style={{ width: `${safePct}%` }}
                      title={`Safe: ${safePct}%`}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded bg-neon-purple shrink-0 animate-pulse" />
                      <span>✨ Dream ({dreamCount} options)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded bg-moderate-yellow shrink-0 animate-pulse" />
                      <span>⚡ Moderate ({moderateCount} options)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded bg-safe-green shrink-0 animate-pulse" />
                      <span>🛡️ Safe ({safeCount} options)</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Toolbar Controls */}
              {results.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-white/5 rounded-2xl p-4 gap-4">
                  <div className="text-xs">
                    <span className="text-slate-400">Analysis Results: </span>
                    <strong className="text-white">{totalCount} college choices matched</strong>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleGenerateSequence}
                      className={`flex-grow sm:flex-grow-0 flex items-center justify-center space-x-1.5 text-xs py-2 px-4 rounded-xl border transition-all cursor-pointer ${
                        isOptimizedOrder
                          ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40 shadow-[0_0_15px_rgba(161,44,255,0.2)]'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <ArrowUpDown size={12} />
                      <span>{isOptimizedOrder ? 'Custom Counseling Order' : 'Optimize Choices Sequence'}</span>
                      {!isPremium && <Lock size={10} className="text-slate-500 ml-1" />}
                    </button>

                    <button
                      onClick={downloadCounselingCSV}
                      className="flex-grow sm:flex-grow-0 flex items-center justify-center space-x-1.5 text-xs py-2 px-4 rounded-xl border bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20 transition-all cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Export Choice List</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Recommended Top Choice Summary Panel */}
              {!loading && results.length > 0 && (
                <Card hoverEffect={false} className="border border-white/10 bg-white/[0.02] p-6 space-y-4 animate-fadeIn">
                  <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                    <Sparkles size={16} className="text-white animate-pulse" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      ✨ Top Recommended Match Summary
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const r1r2 = results.filter(r => r.round === 1 || r.round === 2);
                      const sourceList = r1r2.length > 0 ? r1r2 : results;
                      return generateCounselingOrder(sourceList).slice(0, 3);
                    })().map((choice, idx) => {
                      const tags = getTopChoiceTags(choice, results);
                      return (
                        <div 
                          key={`summary-${choice.cutoffId}`}
                          className="p-4 rounded-xl border border-white/5 bg-brand-dark/40 hover:border-white/10 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-500 font-bold">
                                CHOICE #{idx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-neon-blue font-bold">
                                Rd {choice.round}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white truncate">
                              <a href={`/colleges/${choice.college.id}`} className="hover:underline">
                                {choice.college.name}
                              </a>
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              Branch: <strong className="text-white">{choice.branch}</strong>
                            </p>
                          </div>
                          
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex flex-wrap gap-1">
                              {tags.map(t => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300 font-medium">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Probability:</span>
                              <span className="font-bold text-white">{(choice as any).probability}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Results List renderer */}
              <div className="space-y-4">
                {loading ? (
                  /* Loading Skeletons */
                  Array.from({ length: 3 }).map((_, idx) => (
                    <Card key={idx} hoverEffect={false} className="border border-white/5 bg-brand-dark/20 p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 w-2/3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </div>
                      <div className="grid grid-cols-4 gap-4 border-t border-white/5 pt-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))
                                ) : getActiveResults().length > 0 ? (
                  <>
                    {/* Filter Relaxation Banner */}
                    {isRelaxed && (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start space-x-3 mb-4 animate-fadeIn">
                        <Info size={16} className="text-white mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-white">Showing closest possible matches based on historical trends</p>
                          <p className="text-[11px] text-slate-400 mt-1">{relaxedReason}</p>
                        </div>
                      </div>
                    )}

                    {getActiveResults().map((pred, index) => {
                      const isLocked = pred.isLocked;

                      const cardTheme = {
                        'Safe': 'glow-card-green',
                        'Moderate': 'glow-card-purple',
                        'Dream': 'glow-card-blue'
                      }[pred.status];

                      const statusBadge = {
                        'Safe': <Badge variant="safe">🛡️ Safe Choice ({pred.probability}%)</Badge>,
                        'Moderate': <Badge variant="moderate">⚡ Moderate Chance ({pred.probability}%)</Badge>,
                        'Dream': <Badge variant="info">✨ Dream Option ({pred.probability}%)</Badge>
                      }[pred.status];

                      return (
                        <Card
                          key={pred.cutoffId}
                          hoverEffect={!isLocked}
                          className={`transition-all duration-300 relative border ${
                            isLocked 
                              ? 'border-white/5 bg-brand-dark/20' 
                              : `border-white/5 ${cardTheme}`
                          }`}
                        >
                          {/* Blur Overlay for Paywalled choices */}
                          {isLocked && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-dark/85 backdrop-blur-[6px] rounded-2xl p-6 text-center">
                              <div className="p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-xl text-neon-purple mb-3 shadow-[0_0_15px_rgba(161,44,255,0.1)]">
                                <Lock size={18} className="animate-pulse" />
                              </div>
                              <h4 className="text-sm font-bold text-white mb-1">Choice Option Locked</h4>
                              <p className="text-xs text-slate-400 max-w-[280px] mb-4">
                                Unlock all predictions & view placement reports for just ₹9 one-time.
                              </p>
                              <Button
                                variant="glow"
                                size="sm"
                                onClick={() => setIsPaywallOpen(true)}
                                className="text-xs font-semibold px-5 py-2 cursor-pointer"
                              >
                                Unlock predicting sequence
                              </Button>
                            </div>
                          )}

                          <div className="space-y-4">
                            {/* Top row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-neon-blue font-mono font-bold">
                                    {pred.college.code} • Round {pred.round}
                                  </span>
                                  <span>{statusBadge}</span>
                                </div>
                                
                                <h3 className="text-base font-bold text-white mt-1 hover:text-neon-blue transition-colors">
                                  {isLocked ? (
                                    pred.college.name
                                  ) : (
                                    <a href={`/colleges/${pred.college.id}`}>{pred.college.name}</a>
                                  )}
                                </h3>
                                
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {pred.college.city}, {pred.college.state} • {pred.college.type} Institute
                                </p>
                              </div>

                              {!isLocked && (
                                <div className="flex items-center space-x-3 text-right">
                                  <button
                                    onClick={() => toggleCompare(pred)}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                                      compareList.find(c => c.cutoffId === pred.cutoffId)
                                        ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:border-white/10'
                                    }`}
                                  >
                                    {compareList.find(c => c.cutoffId === pred.cutoffId) ? '✓ Compared' : '+ Compare'}
                                  </button>
                                  <div>
                                    <div className="text-2xl font-black text-white font-mono leading-none">
                                      {pred.score}
                                    </div>
                                    <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mt-0.5">
                                      Choice Index
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-white/5 pt-4 text-[11px] leading-tight">
                              <div>
                                <div className="text-slate-500">Predicted Course</div>
                                <div className="font-semibold text-white mt-0.5">{pred.branch}</div>
                              </div>
                              <div>
                                <div className="text-slate-500">Prev Closing Cutoff</div>
                                <div className="font-semibold text-white mt-0.5 font-mono">
                                  {isLocked ? '••••' : pred.closingRank}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-500">Median Package</div>
                                <div className="font-semibold text-neon-green mt-0.5 font-mono">
                                  {isLocked ? '•• LPA' : `${pred.college.placements_info.median_ctc_lpa} LPA`}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-500">Branch Strength</div>
                                <div className="font-semibold text-white mt-0.5 flex items-center">
                                  <span className="font-mono">{isLocked ? '••%' : `${pred.branchStrength}%`}</span>
                                  {!isLocked && (
                                    <div className="w-8 h-1 bg-white/10 rounded-full ml-1 overflow-hidden shrink-0">
                                      <div 
                                        className="h-full bg-white rounded-full" 
                                        style={{ width: `${pred.branchStrength}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-500">Annual Tuition</div>
                                <div className="font-semibold text-white mt-0.5 font-mono">
                                  {isLocked ? '••••' : `₹${pred.fees.toLocaleString()}`}
                                </div>
                              </div>
                            </div>

                            {/* Advanced recommendation system parameters */}
                            {!isLocked && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/5 pt-3 text-[11px] leading-tight bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                                <div>
                                  <div className="text-slate-500">Expected Closing Rank</div>
                                  <div className="font-semibold text-white mt-0.5 font-mono">
                                    {pred.expectedClosingRank.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-500 font-mono">2024 Cutoff</div>
                                  <div className="font-semibold text-white mt-0.5 font-mono">
                                    {pred.closingRank.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-500">Seat Growth Rate</div>
                                  <div className={`font-semibold mt-0.5 font-mono ${pred.seatGrowthRate >= 0 ? 'text-neon-green' : 'text-risky-red'}`}>
                                    {pred.seatGrowthRate >= 0 ? '+' : ''}{(pred.seatGrowthRate * 100).toFixed(1)}%
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-500">Trend / Volatility</div>
                                  <div className="font-semibold text-white mt-0.5 flex items-center space-x-1">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      pred.trendIndicator === 'Improving' ? 'bg-safe-green/10 text-safe-green' :
                                      pred.trendIndicator === 'Declining' ? 'bg-risky-red/10 text-risky-red' :
                                      'bg-white/5 text-slate-300'
                                    }`}>
                                      {pred.trendIndicator}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      (±{(pred.cutoffVolatility * 100).toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Advanced counseling details */}
                            {!isLocked && (
                              <div className="space-y-3 pt-3 border-t border-white/5">
                                {/* Fee structure breakdown */}
                                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
                                  <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Tuition Fees</span>
                                    <span className="font-mono text-white font-semibold">₹{pred.feeStructure.tuitionFees.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Dev/Other Fees</span>
                                    <span className="font-mono text-white font-semibold">₹{pred.feeStructure.developmentFees.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Total Annual Cost</span>
                                    <span className="font-mono text-white font-semibold">₹{pred.feeStructure.totalAnnualFees.toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Recommendation Reason */}
                                <p className="text-xs text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                                  <span className="font-semibold text-white mr-1">Counselor Recommendation:</span>
                                  {pred.recommendationReason}
                                </p>

                                {/* Historical cutoff trend rounds */}
                                <div className="text-[10px] text-slate-500">
                                  <span className="font-bold text-white block mb-1.5 text-[8px] uppercase tracking-wider">Historical Cutoffs Trends</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {pred.historicalTrend.slice(0, 4).map((trend, idx) => (
                                      <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300 font-mono text-[9px]">
                                        {trend.year} R{trend.round}: <strong className="text-white">{trend.closingRank}</strong>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </>
                ) : (
                  <Card hoverEffect={false} className="border border-white/5 bg-brand-dark/20 p-12 text-center text-slate-400">
                    <Search className="mx-auto text-slate-600 mb-3" size={32} />
                    {hasPredicted ? (
                      <>
                        <p className="text-sm font-semibold text-white">No Matching Colleges Found</p>
                        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                          We couldn't find any college options matching a rank of <strong className="text-neon-blue font-mono">{rank}</strong> in category <strong className="text-neon-purple font-mono">{category}</strong>.
                          Try entering a higher rank value, changing category options, or clearing active filters.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">No predictions generated yet.</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Enter your counseling rank details in the left panel and click predict.
                        </p>
                      </>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSuccess={() => {
          setIsPremium(true);
          // Auto re-trigger predict check to unlock content
          const form = document.querySelector('form');
          if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }}
      />

      {/* Compare Drawer Overlay */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-dark/95 border-t border-white/10 backdrop-blur-md py-4 px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] animate-slideUp">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Choice Comparison Drawer</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Comparing {compareList.length} of 3 selected colleges</p>
              </div>
              <button 
                onClick={() => setCompareList([])}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer bg-transparent border-none"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-3/4">
              {compareList.map((item) => (
                <div key={item.cutoffId} className="relative p-3 rounded-xl border border-white/5 bg-white/[0.02] text-[11px] leading-snug flex flex-col justify-between">
                  <button 
                    onClick={() => toggleCompare(item)} 
                    className="absolute top-2 right-2 text-slate-400 hover:text-white font-bold font-mono text-[9px] cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                  <div className="pr-4">
                    <div className="font-bold text-white truncate">{item.college.name}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.branch} • Rd {item.round}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-300">
                    <div>
                      <div className="text-slate-500 text-[8px] uppercase">Chance</div>
                      <div className="font-semibold text-white">{item.probability}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[8px] uppercase">Fees</div>
                      <div className="font-semibold text-neon-green">₹{(item.fees / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[8px] uppercase">Trend</div>
                      <div className={`font-semibold ${item.trendIndicator === 'Improving' ? 'text-safe-green' : item.trendIndicator === 'Declining' ? 'text-risky-red' : 'text-slate-400'}`}>
                        {item.trendIndicator}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
