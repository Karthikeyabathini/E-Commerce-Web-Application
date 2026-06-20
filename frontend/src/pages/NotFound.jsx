import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 py-12 font-sans">
      <div className="max-w-md w-full text-center space-y-6 animate-slide-up">
        
        {/* Visual 404 block */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 bg-accent/15 border border-accent/30 rounded-full flex items-center justify-center text-accent">
            <HelpCircle className="w-12 h-12 stroke-1" />
          </div>
          <span className="absolute -top-1 -right-2 px-3 py-1 bg-accent text-white text-[10px] font-black uppercase rounded-full tracking-wider animate-pulse">
            Error 404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">Page Lost in Space</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto">
            The page path you requested doesn't exist, was deleted, or is temporarily restricted.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <Link
            to="/"
            className="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            Return to ShopSphere
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
