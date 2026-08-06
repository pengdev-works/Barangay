import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, FileText, Users, ArrowRight, HeartHandshake, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-brand-500 selection:text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500 text-white p-2.5 rounded-2xl shadow-lg shadow-brand-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">BarangayConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center gap-2"
          >
            Portal Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 py-20 lg:py-32 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl -z-10" />

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-6">
          <ShieldCheck className="w-4 h-4" /> Official Barangay Governance System
        </span>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
          Smart Governance for a <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">Better Community</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Empowering Barangay San Jose residents and officials with seamless document processing, blotter tracking, emergency requests, and public announcements.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 font-bold text-base transition-all shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2"
          >
            Access Resident Portal <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Comprehensive Barangay Services</h2>
          <p className="text-slate-400 mt-2">Everything you need for fast, transparent local government response.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:border-brand-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Online Document Request</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Apply for Barangay Clearance, Residency Certificates, and Indigency Letters online with status tracking.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Emergency Assistance</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Request medical aid, financial relief, and disaster assistance directly to barangay officials.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Resident Registry</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Complete census records, household grouping, senior citizen & PWD tracking for targeted support.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 BarangayConnect. All Rights Reserved. Smart Barangay Management System.
      </footer>
    </div>
  );
};

export default LandingPage;
