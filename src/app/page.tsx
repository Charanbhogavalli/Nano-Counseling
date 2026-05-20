'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Shield, GraduationCap, ChevronRight, Zap, Target, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main Hero Container */}
      <main className="flex-grow">
        {/* Glow Spheres Backdrops */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-neon-purple/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-neon-blue/5 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2">
              <Badge variant="premium" className="px-3.5 py-1">
                <Sparkles size={12} className="mr-1 text-white animate-spin" />
                Empowering Students for 2026 Admissions
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-glow-blue"
            >
              Indian Engineering Admissions, <br />
              <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent">
                Predicted with Absolute Precision
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Analyze cutoffs from EAMCET, COMEDK, KCET, and JEE Main. See which engineering branch fits your rank, budget, and location using previous-year dataset records.
            </motion.p>

            <motion.div variants={itemVariants} className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/predictor">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Run Predictive Analysis
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse College Database
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Interactive Feature Visual Grid */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-28 relative"
          >
            <motion.div variants={itemVariants}>
              <Card glowColor="purple" className="h-full space-y-4">
                <div className="p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-xl text-neon-purple w-fit shadow-[0_0_15px_rgba(161,44,255,0.15)]">
                  <Target size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Precise Cutoff Matching</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Leverages actual previous rounds database cutoffs down to specific exam, state quotas, and student categories.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card glowColor="blue" className="h-full space-y-4">
                <div className="p-3 bg-neon-blue/10 border border-neon-blue/20 rounded-xl text-neon-blue w-fit shadow-[0_0_15px_rgba(0,210,255,0.15)]">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Best Choice Engine</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Smart preference sorting that prioritizes higher placement metrics, lower annual fees, and NIRF rankings.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card glowColor="green" className="h-full space-y-4">
                <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-xl text-neon-green w-fit shadow-[0_0_15px_rgba(0,255,135,0.15)]">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Counseling Order Sequences</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Automatically orders college-branch pairs to construct the most optimal admission choices for counseling entry.
                </p>
              </Card>
            </motion.div>
          </motion.section>

          {/* Platform Free Announcement */}
          <section className="mt-32 max-w-4xl mx-auto space-y-12">
            <Card hoverEffect={false} className="border border-white/5 bg-brand-dark/40 overflow-hidden relative glow-card-purple p-8 md:p-12 text-center space-y-6">
              <div className="mx-auto p-4 bg-white/5 border border-white/10 rounded-2xl text-white w-fit shadow-[0_0_15px_rgba(255,255,255,0.08)]">
                <Sparkles size={28} />
              </div>
              <div className="space-y-2 max-w-2xl mx-auto">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">100% Free Admissions Guidance</h2>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  We believe every student deserves access to accurate engineering cutoff insights without paywalls. 
                  Nano Counseling offers unrestricted prediction logs, counseling sequence builders, and historical charts completely free of charge.
                </p>
              </div>
              <div className="pt-4 max-w-xs mx-auto">
                <Link href="/predictor">
                  <Button variant="primary" size="lg" className="w-full justify-center">
                    Launch Predictor Tool
                  </Button>
                </Link>
              </div>
            </Card>
          </section>

          {/* Testimonial / Brand Assurance */}
          <section className="mt-32 border-t border-white/5 pt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Shield size={20} className="mr-2 text-neon-blue" />
                Nano Counseling Data Guarantee
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                We believe in absolute data accuracy. Our predictor matches exact PDF releases from official bodies (KEA, COMEDK, CSAB) instead of generating generic AI guesses.
              </p>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 font-light text-sm italic text-slate-300">
              <p>
                &ldquo;This tool sequence helped me map COMEDK choices perfectly. Placed RVCE CSE above others, got seat in round 1 itself! Unlocking for ₹9 saved hours of excel sheets.&rdquo;
              </p>
              <div className="text-xs font-semibold text-neon-blue not-italic">— Rahul Sharma, RVCE CSE '29</div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
