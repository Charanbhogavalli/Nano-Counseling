'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { dbService } from '@/lib/supabase';
import { College } from '@/lib/mockDb';
import { Search, MapPin, Award, Building, ArrowUpRight, ShieldAlert } from 'lucide-react';

export default function SearchPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [maxFees, setMaxFees] = useState(500000);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);

  useEffect(() => {
    const loadColleges = async () => {
      const data = await dbService.getColleges();
      setColleges(data);
      setFilteredColleges(data);
    };
    loadColleges();
  }, []);

  useEffect(() => {
    let result = colleges;

    if (searchQuery) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'All') {
      result = result.filter((c) => c.type === selectedType);
    }

    result = result.filter((c) => c.fees_median <= maxFees);

    setFilteredColleges(result);
  }, [searchQuery, selectedType, maxFees, colleges]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-neon-purple/5 blur-[100px] pointer-events-none" />

        <div className="space-y-8 relative">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center">
              <Building className="mr-2 text-neon-blue" size={24} />
              Engineering Campuses Directory
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Search and filter colleges across the country by placements, rankings, and fees.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Filter Control Box */}
            <div className="lg:col-span-4">
              <Card hoverEffect={false} className="border border-white/5 bg-brand-dark/40 p-6 space-y-5 text-xs sticky top-24">
                <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3">Filters</h3>
                
                {/* Search Bar */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Search by name or code</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. RVCE, Trichy..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-brand-dark/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-blue transition-all"
                    />
                  </div>
                </div>

                {/* College type */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Institution Category</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neon-blue transition-all"
                  >
                    <option value="All">All Types</option>
                    <option value="Government">Government / Public</option>
                    <option value="Private">Private</option>
                    <option value="Autonomous">Autonomous</option>
                    <option value="Aided">Aided</option>
                  </select>
                </div>

                {/* Fees Limit */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Max Tuition Fee</span>
                    <span className="text-white font-mono">₹{maxFees.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="500000"
                    step="10000"
                    value={maxFees}
                    onChange={(e) => setMaxFees(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>₹50K</span>
                    <span>₹500K</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* College Cards Grid */}
            <div className="lg:col-span-8 space-y-4">
              {filteredColleges.length > 0 ? (
                filteredColleges.map((clg) => (
                  <Card key={clg.id} className="border border-white/5 p-6 hover:border-neon-blue/20 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="info">{clg.code}</Badge>
                          <span className="text-xs text-slate-400 flex items-center">
                            <MapPin size={12} className="mr-1 text-neon-blue" />
                            {clg.city}, {clg.state}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-tight">
                          <Link href={`/colleges/${clg.id}`} className="hover:text-neon-blue transition-colors">
                            {clg.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 max-w-xl font-light">
                          {clg.description}
                        </p>
                      </div>

                      {/* Ratings/Rankings column */}
                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 gap-2">
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 tracking-wider">NIRF Ranking</div>
                          <div className="text-sm font-bold text-white mt-0.5">#{clg.ranking}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 tracking-wider">Median Fees</div>
                          <div className="text-sm font-semibold text-white mt-0.5 font-mono">
                            ₹{clg.fees_median.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Placements and CTA Footer */}
                    <div className="flex justify-between items-center border-t border-white/5 mt-5 pt-4 text-xs">
                      <div className="text-slate-400">
                        Median Placements package: <strong className="text-neon-green font-mono">{clg.placements_info.median_ctc_lpa} LPA</strong>
                      </div>
                      <Link href={`/colleges/${clg.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Inspect Admission Cutoffs
                          <ArrowUpRight size={12} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))
              ) : (
                <Card hoverEffect={false} className="border border-white/5 p-12 text-center text-slate-400 bg-brand-dark/20">
                  <ShieldAlert size={32} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-sm">No institutions match the current filters.</p>
                  <p className="text-xs text-slate-500 mt-1">Try loosening search keywords or raising budget limits.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
