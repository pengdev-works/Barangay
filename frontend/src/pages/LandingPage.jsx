import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Users,
  ArrowRight,
  HeartHandshake,
  Search,
  PhoneCall,
  Megaphone,
  Calendar,
  ChevronDown,
  HelpCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Award,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { formatDate } from '../utils/formatters';

const LandingPage = () => {
  const navigate = useNavigate();
  const [certSearchId, setCertSearchId] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements/public', { params: { limit: 3 } });
        if (res.data.success) {
          setAnnouncements(res.data.announcements || []);
        }
      } catch (err) {
        console.error('Failed to load public announcements', err);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (certSearchId.trim()) {
      navigate(`/verify-certificate/${certSearchId.trim()}`);
    }
  };

  const FAQS = [
    {
      q: 'What are the requirements for applying for a Barangay Clearance?',
      a: 'Applicants must present a valid government-issued ID, proof of residency (e.g. utility bill or household record), and state the specific purpose of application.'
    },
    {
      q: 'How long does certificate processing take?',
      a: 'Most standard requests (Barangay Clearance, Certificate of Residency, Certificate of Indigency) are processed within 24 hours upon online submission or walk-in filing.'
    },
    {
      q: 'Who is eligible for a Certificate of Indigency?',
      a: 'Bona fide residents of the barangay who belong to low-income households and require financial, medical, or legal assistance from government agencies.'
    },
    {
      q: 'How can I report a community incident or blotter dispute?',
      a: 'Logged-in residents can file complaints directly through the Resident Portal, or visit the Barangay Hall for formal mediation with the Lupong Tagapamayapa.'
    }
  ];

  const HOTLINES = [
    { title: 'Barangay Tanod Response', phone: '0917-555-0199', icon: ShieldCheck, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
    { title: 'Rural Health Unit (RHU)', phone: '0998-555-0122', icon: HeartHandshake, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'MDRRMO Disaster Rescue', phone: '0922-555-0144', icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { title: 'Municipal Police Station', phone: '0918-555-0177', icon: PhoneCall, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
  ];

  const OFFICIALS = [
    { name: 'Hon. Juan Dela Cruz', role: 'Barangay Captain', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300' },
    { name: 'Kgd. Maria Santos', role: 'Committee on Health', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300' },
    { name: 'Kgd. Roberto Reyes', role: 'Committee on Peace & Order', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300' },
    { name: 'Hon. Mark Gonzales', role: 'SK Chairperson', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white font-sans">
      
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2">
        <Megaphone className="w-4 h-4 animate-bounce" />
        <span>Welcome to the Official Barangay Portal. Online document requests & public verification are active.</span>
      </div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-none">Brgy. La Paz</span>
            <span className="text-[11px] text-slate-400">Province of Abra • LGU Portal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center gap-2 text-white"
          >
            Resident Portal Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-brand-500/10 rounded-full blur-3xl -z-10" />

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-6">
          <Award className="w-4 h-4" /> Smart Governance & Public e-Services
        </span>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-white">
          Transparent Service for a <span className="bg-gradient-to-r from-brand-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">Better Community</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Streamlining clearance applications, blotter intake, emergency assistance, and public announcements for all residents of Barangay La Paz.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 font-bold text-sm transition-all shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 text-white"
          >
            Access Resident Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Certificate Quick Verification Widget */}
        <div className="mt-12 max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
            <Search className="w-4 h-4" /> Verify Barangay Certificate Online
          </div>
          <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              placeholder="Enter Certificate Control ID (e.g. uuid-1234)..."
              value={certSearchId}
              onChange={(e) => setCertSearchId(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-white"
            >
              <CheckCircle2 className="w-4 h-4" /> Verify Authenticity
            </button>
          </form>
        </div>
      </section>

      {/* Public Announcements Stream */}
      {announcements.length > 0 && (
        <section className="px-6 lg:px-12 py-12 max-w-7xl mx-auto border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" /> Community Advisories & Bulletin
              </h2>
              <p className="text-xs text-slate-400">Official news and announcements from the Barangay Council</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((item) => (
              <div key={item.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {item.category || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-500">{formatDate(item.created_at)}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core Services Grid */}
      <section className="px-6 lg:px-12 py-16 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Comprehensive Digital Services</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Designed for fast, transparent response to every resident's need.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">E-Clearance & Certificates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Request Barangay Clearances, Certificates of Indigency, Residency, and Business Permits online with QR Code verification.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Emergency Aid & Social Support</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              File requests for medical assistance, financial relief, senior citizen programs, PWD aid, and disaster assistance.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Resident Census & Demographics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintain household records, voter verification, 4Ps beneficiary tracking, and purok spatial data.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Hotlines Directory */}
      <section className="px-6 lg:px-12 py-16 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <PhoneCall className="w-6 h-6 text-rose-400" /> Emergency Hotline Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">24/7 direct lines for emergency response and medical aid</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOTLINES.map((h, i) => {
            const IconComponent = h.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${h.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{h.title}</h4>
                  <p className="text-sm font-extrabold text-slate-200 mt-0.5">{h.phone}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Barangay Officials Showcase */}
      <section className="px-6 lg:px-12 py-16 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white">Barangay Leadership & Council</h2>
          <p className="text-xs text-slate-400 mt-1">Dedicated public servants committed to community development</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OFFICIALS.map((off, idx) => (
            <div key={idx} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 group hover:border-brand-500/40 transition-all">
              <img
                src={off.img}
                alt={off.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-brand-500/30 group-hover:scale-105 transition-transform"
              />
              <div>
                <h3 className="font-bold text-sm text-white">{off.name}</h3>
                <p className="text-xs text-brand-400 font-medium mt-0.5">{off.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 lg:px-12 py-16 max-w-4xl mx-auto border-t border-slate-800/60">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-brand-400" /> Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 mt-1">Common answers regarding barangay services and clearances</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-200 flex justify-between items-center gap-4 hover:text-brand-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Barangay La Paz</h4>
            <p className="text-slate-400">Municipality of La Paz, Province of Abra, Philippines</p>
            <p className="flex items-center gap-1.5 text-slate-400 pt-1">
              <Clock className="w-3.5 h-3.5 text-brand-400" /> Mon - Fri: 8:00 AM - 5:00 PM
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Quick Links</h4>
            <ul className="space-y-1">
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Resident Portal Login</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Apply for Clearance</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Report Incident</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Government Hotline</h4>
            <p className="text-slate-400">National Emergency: 911</p>
            <p className="text-slate-400">Barangay Hall Direct: (074) 123-4567</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 text-center text-slate-500">
          © 2026 Barangay La Paz, Province of Abra. All Rights Reserved. Smart Governance System.
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
