import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, ChevronRight, BookOpen, GraduationCap, Compass } from 'lucide-react';
import { Metadata } from 'next';

interface Params {
  params: Promise<{ slug: string }> | { slug: string };
}

// Generate Dynamic Metadata
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const topics: { [key: string]: { title: string; desc: string } } = {
    'comedk-college-predictor': {
      title: 'COMEDK College Predictor 2026 - Cutoffs & Placement Ranks',
      desc: 'Predict your engineering seat in RVCE, BMSCE, and MSRIT based on COMEDK previous year closing ranks and placement data.'
    },
    'eamcet-college-predictor': {
      title: 'EAMCET College Predictor 2026 - TS & AP Engineering Admissions',
      desc: 'Evaluate EAMCET rank prospects for JNTU, Osmania, CBIT, and other major colleges across Telangana and Andhra Pradesh.'
    },
    'jee-best-colleges-by-rank': {
      title: 'JEE Main College Predictor 2026 - NIT, IIIT Seat Tracker',
      desc: 'Find the best NITs, IIITs, and GFTIs for your JEE Main percentile and rank. Filter by branch, fees, and state quota.'
    },
    'city-wise-colleges-bengaluru': {
      title: 'Best Engineering Colleges in Bengaluru 2026 - Rank & Placements',
      desc: 'Compare Bengaluru engineering colleges including RVCE, PESU, and BMSCE based on fees, placements, and cutoffs.'
    },
    'branch-wise-rankings-computer-science': {
      title: 'Top Computer Science (CSE) Cutoffs & College Rankings',
      desc: 'Discover previous year cutoff closing ranks for Computer Science engineering across JEE, COMEDK, and EAMCET.'
    }
  };

  const topic = topics[slug] || {
    title: 'Engineering Admission predictors & Cutoffs Guide',
    desc: 'Access official counseling cutoff indices and placement databases for engineering colleges in India.'
  };

  return {
    title: topic.title,
    description: topic.desc
  };
}

export default async function SeoPage({ params }: Params) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Custom Content Mapping based on Slug
  const topicsContent: { [key: string]: any } = {
    'comedk-college-predictor': {
      h1: 'COMEDK College Predictor & Rank Assessment 2026',
      subtitle: 'Unlock cutoffs for RVCE, BMSCE, MSRIT, and other top Consortium colleges of Karnataka.',
      exam: 'COMEDK',
      stats: ['150+ colleges participating', '3 Counseling Rounds tracked', '100% official cutoff indices'],
      article: 'COMEDK UGET counseling is highly competitive, attracting students nationwide to Karnataka\'s elite private colleges. Knowing the closing ranks of previous years is crucial to building an entry preference form. Our predictor uses historical cutoff datasets, letting you filter options by budget and branch to locate the best matches for your rank.'
    },
    'eamcet-college-predictor': {
      h1: 'TS & AP EAMCET College Predictor & Cutoff Trends 2026',
      subtitle: 'Evaluate your admissions probability in JNTU, CBIT, Vasavi, and top state institutions.',
      exam: 'TS-EAMCET',
      stats: ['250+ TS & AP engineering institutes', 'Category-wise (OBC, SC, ST, GM) filters', 'Fee structures updated'],
      article: 'State-level engineering admissions through EAMCET require thorough strategy. Branch priorities, local vs non-local quotas, and gender classifications determine closing ranks. This predictor simplifies the complexity, analyzing AP & TS datasets to classify choices into Safe, Moderate, and Risky categories based on your rank.'
    },
    'jee-best-colleges-by-rank': {
      h1: 'JEE Main College Predictor - NIT & IIIT Seat Tracker',
      subtitle: 'Calculate your probability of getting into NIT Trichy, Surathkal, Warangal, and IIIT Hyderabad.',
      exam: 'JEE Main',
      stats: ['31 NITs & 26 IIITs indexed', 'Home State vs Other State quota support', 'JoSAA & CSAB counseling analysis'],
      article: 'Cracking JEE Main is only half the battle; locking the right NIT or IIIT branch requires precision. Using our choice ranking index, students can check closing ranks, placement records, and median fees. Analyze admission prospects based on category quotas (OBC-NCL, SC, ST, General) and gender pools.'
    },
    'city-wise-colleges-bengaluru': {
      h1: 'Top Engineering Colleges in Bengaluru - Cutoffs & Ranks',
      subtitle: 'A complete placement-driven analysis of Bengaluru\'s elite campuses.',
      exam: 'COMEDK',
      stats: ['RVCE, BMS, PESU, MSRIT profiles', 'Placement median CTC comparison', 'Location mapping filters'],
      article: 'Bengaluru is India\'s technology hub, offering unmatched internships and core computer science placements. Access comprehensive guides for city-wide engineering choices. Filter by tuition fees, NIRF national rankings, and average packages, then project your admission chances using our tool.'
    },
    'branch-wise-rankings-computer-science': {
      h1: 'Computer Science (CSE) Engineering - Top Cutoff Rankings',
      subtitle: 'Analyze competitive CSE and AIML cutoffs across JEE, KCET, and COMEDK.',
      exam: 'COMEDK',
      stats: ['CSE & AIML specializations', 'Previous closing ranks comparison', 'Industry placement analytics'],
      article: 'Computer Science remains the most sought-after engineering course. Ranks close early in rounds, leaving little room for error. Review cutoff thresholds for CSE and related specializations across major counseling schemes to construct a bulletproof preference form.'
    }
  };

  const content = topicsContent[slug] || {
    h1: 'Engineering counseling predictor Guide & Cutoffs',
    subtitle: 'Evaluate placement indices and cutoff databases for major counseling boards.',
    exam: 'COMEDK',
    stats: ['All counseling systems support', '100% verified cutoff databases', 'Sleek prediction engines'],
    article: 'Indian engineering counseling is highly complex with multiple rounds, changing quotas, and category seats. Utilize our predictor to match historical admission benchmarks against your rank. Refine parameters like tuition budgets, preferred locations, and placements statistics to unlock a successful counseling strategy.'
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <Navbar />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative">
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-neon-purple/5 blur-[120px] pointer-events-none" />

        <article className="space-y-10 relative">
          
          {/* Header Section */}
          <header className="space-y-4 border-b border-white/5 pb-8">
            <div className="inline-flex items-center space-x-2">
              <Badge variant="info">Counseling Guide</Badge>
              <span className="text-xs text-slate-500 font-mono">Updated for 2026 session</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight text-glow-blue">
              {content.h1}
            </h1>
            
            <p className="text-base text-slate-400 font-light max-w-3xl leading-relaxed">
              {content.subtitle}
            </p>
          </header>

          {/* Quick Stats list */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.stats.map((stat: string, index: number) => (
              <Card key={index} hoverEffect={false} className="border border-white/5 bg-white/[0.01] p-5 flex items-start space-x-3">
                <CheckCircle2 className="text-neon-green shrink-0 mt-0.5" size={16} />
                <span className="text-xs text-slate-300 font-medium">{stat}</span>
              </Card>
            ))}
          </section>

          {/* Main Article Body */}
          <section className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-6 font-light">
            <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-neon-blue first-letter:mr-1">
              {content.article}
            </p>
            <p>
              Admissions rely on dynamic factors like pool seats, choice locks, and round-wise vacancy. Reviewing benchmarks from previous cycles offers a stable proxy. Using our weighted Choice Score system (incorporating fees, reputation scores, and placement stats), students receive structured suggestions.
            </p>
          </section>

          {/* Call to Action to Predictor */}
          <section className="pt-6">
            <Card hoverEffect={false} className="border border-neon-purple/20 bg-gradient-to-br from-brand-dark to-neon-purple/5 p-8 text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Generate Your Personalized Choice List</h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Run a custom analysis using your rank, category, and preferred branch on the prediction workbench.
                </p>
              </div>
              <div className="flex justify-center">
                <Link href={`/predictor?exam=${content.exam}`}>
                  <Button variant="primary" size="lg">
                    Launch Predictor
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}
