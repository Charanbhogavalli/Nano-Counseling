import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { dbService } from '@/lib/supabase';
import { Building, MapPin, Award, IndianRupee, Globe, ArrowLeft, ArrowUpRight, Percent, TrendingUp } from 'lucide-react';

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export default async function CollegeDetailsPage({ params }: Params) {
  // Resolve params for Next.js App Router (compatible with both Promise & synchronous params)
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const college = await dbService.getCollegeById(id);
  const cutoffs = await dbService.getCutoffs();

  if (!college) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-dark">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-white">College profile not found</h2>
            <Link href="/search">
              <Button variant="outline">Back to Directory</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter cutoffs for this college
  const collegeCutoffs = cutoffs.filter((c) => c.college_id === college.id);

  // Extract general category cutoffs for charting (trends)
  const chartCutoffs = collegeCutoffs.filter(
    (c) => c.category.toLowerCase() === 'general' || c.category.toLowerCase() === 'gm'
  );

  // Group by branch code
  const cutoffsByBranch: { [branch: string]: typeof chartCutoffs } = {};
  chartCutoffs.forEach((c) => {
    if (!cutoffsByBranch[c.branch]) {
      cutoffsByBranch[c.branch] = [];
    }
    cutoffsByBranch[c.branch].push(c);
  });

  // Calculate some chart lines
  // Let's create an elegant list of branches for trend analysis
  const displayBranches = Object.keys(cutoffsByBranch).slice(0, 3); // show up to 3 branches in trend

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-neon-purple/5 blur-[100px] pointer-events-none" />

        <div className="space-y-8 relative">
          {/* Back btn */}
          <div>
            <Link href="/predictor" className="inline-flex items-center text-xs text-slate-400 hover:text-neon-blue transition-colors">
              <ArrowLeft size={12} className="mr-1" />
              Back to Predictor Tool
            </Link>
          </div>

          {/* Hero Banner card */}
          <Card hoverEffect={false} className="border border-white/5 bg-brand-dark/40 overflow-hidden relative glow-card-purple p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="info">{college.code}</Badge>
                  <Badge variant="default">{college.type} Institute</Badge>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white text-glow-blue">
                  {college.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center">
                    <MapPin size={14} className="mr-1.5 text-neon-blue" />
                    {college.city}, {college.state}
                  </span>
                  <span className="flex items-center">
                    <Globe size={14} className="mr-1.5 text-neon-blue" />
                    <a href={college.website} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white">
                      Official Portal <ArrowUpRight size={10} className="inline ml-0.5" />
                    </a>
                  </span>
                </div>
              </div>

              {/* Placements Spotlight Badge */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center space-y-1 w-full lg:w-auto">
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Median Package</div>
                <div className="text-3xl font-extrabold text-neon-green font-mono">{college.placements_info.median_ctc_lpa} LPA</div>
                <div className="text-xs text-slate-400 mt-1">Highest: {college.placements_info.highest_ctc_lpa} LPA</div>
              </div>
            </div>

            <p className="text-sm text-slate-300 mt-6 leading-relaxed font-light border-t border-white/5 pt-6 max-w-4xl">
              {college.description}
            </p>
          </Card>

          {/* Highlights grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverEffect={false} className="border border-white/5 p-6 flex items-center space-x-4">
              <div className="p-3.5 bg-neon-purple/10 border border-neon-purple/20 rounded-xl text-neon-purple">
                <Award size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-500">NIRF National Rank</div>
                <div className="text-xl font-bold text-white mt-0.5">#{college.ranking}</div>
              </div>
            </Card>

            <Card hoverEffect={false} className="border border-white/5 p-6 flex items-center space-x-4">
              <div className="p-3.5 bg-neon-blue/10 border border-neon-blue/20 rounded-xl text-neon-blue">
                <IndianRupee size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Approx. Median Annual Fees</div>
                <div className="text-xl font-bold text-white mt-0.5">₹{college.fees_median.toLocaleString()}</div>
              </div>
            </Card>

            <Card hoverEffect={false} className="border border-white/5 p-6 flex items-center space-x-4">
              <div className="p-3.5 bg-neon-green/10 border border-neon-green/20 rounded-xl text-neon-green">
                <Percent size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Overall Placement Rate</div>
                <div className="text-xl font-bold text-white mt-0.5">{college.placements_info.placement_percentage}% placed</div>
              </div>
            </Card>
          </div>

          {/* Trends and Cutoff Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Cutoff trends line graph */}
            <div className="lg:col-span-8">
              <Card hoverEffect={false} className="border border-white/5 p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center">
                    <TrendingUp size={16} className="mr-2 text-neon-blue" />
                    Admission Cutoff Trends (Round 1 General Category)
                  </h3>
                </div>

                {/* SVG Graph rendering */}
                {displayBranches.length > 0 ? (
                  <div className="space-y-6">
                    <div className="h-[220px] w-full border-l border-b border-white/10 relative p-4 flex items-end">
                      
                      {/* Grid background lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 opacity-10">
                        <div className="border-t border-white w-full" />
                        <div className="border-t border-white w-full" />
                        <div className="border-t border-white w-full" />
                      </div>

                      {/* Custom SVG Line Chart */}
                      <svg className="w-full h-full absolute inset-0 p-4 overflow-visible">
                        {displayBranches.map((brCode, brIdx) => {
                          const points = cutoffsByBranch[brCode]
                            ?.filter((c) => c.round === 1)
                            .sort((a, b) => a.year - b.year);

                          if (!points || points.length < 2) return null;

                          // Map years (2023, 2024, 2025) to X and Y coordinates
                          // X coords: 2023 = 10%, 2024 = 50%, 2025 = 90%
                          // Y coords: Higher rank = lower visual position (inverse scaling)
                          const minRank = Math.min(...points.map((p) => p.closing_rank)) * 0.8;
                          const maxRank = Math.max(...points.map((p) => p.closing_rank)) * 1.2;

                          const getX = (year: number) => {
                            if (year === 2023) return '10%';
                            if (year === 2024) return '50%';
                            return '90%';
                          };

                          const getY = (rankVal: number) => {
                            const ratio = (rankVal - minRank) / (maxRank - minRank);
                            // SVG coordinates are 0 at top, so invert:
                            return `${100 - ratio * 80}%`;
                          };

                          const color = ['#ffffff', '#a3a3a3', '#525252'][brIdx % 3];

                          // Construct path d string
                          const pathD = points
                            .map((p, pIdx) => `${pIdx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.closing_rank)}`)
                            .join(' ');

                          return (
                            <g key={brCode}>
                              {/* Glowing Line */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke={color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                              />
                              {/* Anchor Points */}
                              {points.map((p) => (
                                <g key={p.id}>
                                  <circle
                                    cx={getX(p.year)}
                                    cy={getY(p.closing_rank)}
                                    r="5"
                                    fill={color}
                                  />
                                  <text
                                    x={getX(p.year)}
                                    y={getY(p.closing_rank)}
                                    dy="-10"
                                    textAnchor="middle"
                                    fill="#ffffff"
                                    fontSize="10"
                                    fontFamily="monospace"
                                    fontWeight="bold"
                                  >
                                    {p.closing_rank}
                                  </text>
                                </g>
                              ))}
                            </g>
                          );
                        })}
                      </svg>

                      {/* X Axis Labels */}
                      <div className="absolute -bottom-6 inset-x-0 flex justify-between px-12 text-[10px] font-mono text-slate-500">
                        <span>2023 Admission</span>
                        <span>2024 Admission</span>
                        <span>2025 Admission</span>
                      </div>
                    </div>

                    {/* Chart Legends */}
                    <div className="flex flex-wrap gap-4 text-xs pt-4 border-t border-white/5">
                      {displayBranches.map((brCode, idx) => {
                        const color = ['bg-white', 'bg-neutral-400', 'bg-neutral-600'][idx % 3];
                        return (
                          <div key={brCode} className="flex items-center space-x-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                            <span className="text-slate-300 font-semibold">{brCode} cutoff trend</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-10">No historical trends available for plotting.</p>
                )}
              </Card>
            </div>

            {/* In-depth Cutoffs Tables */}
            <div className="lg:col-span-4">
              <Card hoverEffect={false} className="border border-white/5 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Historical Cutoff Registry</h3>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {collegeCutoffs.length > 0 ? (
                    collegeCutoffs
                      .sort((a, b) => b.year - a.year || a.round - b.round)
                      .map((cut) => (
                        <div key={cut.id} className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-white">{cut.branch} ({cut.category})</span>
                            <Badge variant="info">Year {cut.year}</Badge>
                          </div>
                          <div className="grid grid-cols-2 text-slate-400 font-mono text-[10px]">
                            <div>Closing Rank: <strong className="text-white">{cut.closing_rank}</strong></div>
                            <div>Round: <strong className="text-white">{cut.round}</strong></div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No raw cutoff records logged.</p>
                  )}
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
