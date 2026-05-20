import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-brand-dark/50 py-12 text-slate-500 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-base tracking-tight">Nano Counseling</h4>
            <p className="text-xs leading-relaxed">
              India\'s most advanced engineering counseling prediction engine. Unlocking futures with high-performance indices and historic cutoffs.
            </p>
          </div>
          <div>
            <h5 className="text-white font-medium mb-3">Predictors</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/seo/comedk-college-predictor" className="hover:text-neon-blue transition-colors">
                  COMEDK College Predictor
                </Link>
              </li>
              <li>
                <Link href="/seo/eamcet-college-predictor" className="hover:text-neon-blue transition-colors">
                  EAMCET College Predictor
                </Link>
              </li>
              <li>
                <Link href="/seo/jee-best-colleges-by-rank" className="hover:text-neon-blue transition-colors">
                  JEE Main College Predictor
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-medium mb-3">Rankings</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/seo/city-wise-colleges-bengaluru" className="hover:text-neon-blue transition-colors">
                  Best Colleges in Bengaluru
                </Link>
              </li>
              <li>
                <Link href="/seo/branch-wise-rankings-computer-science" className="hover:text-neon-blue transition-colors">
                  Top Computer Science Branch cutoffs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-medium mb-3">Newsletter</h5>
            <p className="text-xs mb-3">Stay updated with latest counseling rounds, dates, and trends.</p>
            <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-neon-blue/40 transition-all bg-white/5">
              <input
                type="email"
                placeholder="email@address.com"
                className="bg-transparent border-0 px-3 py-1.5 text-xs text-white focus:outline-none w-full"
              />
              <button className="bg-gradient-to-r from-neon-purple to-neon-blue px-3 py-1.5 text-xs text-white font-semibold hover:opacity-90 cursor-pointer">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Nano Counseling. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
