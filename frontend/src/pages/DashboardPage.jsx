import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { Users, Home, FileText, AlertTriangle, Heart, UserCheck, Megaphone, Calendar, HandHeart, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import BarangayMap from '../components/gis/BarangayMap';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// =======================
// Admin / Staff Dashboard
// =======================
const AdminDashboard = ({ stats, charts }) => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Barangay Dashboard</h1>
      <p className="text-sm text-slate-500">Real-time demographic and operational metrics</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Residents" value={stats?.totalResidents || 0} icon={Users} color="brand" />
      <StatCard title="Total Households" value={stats?.totalHouseholds || 0} icon={Home} color="emerald" />
      <StatCard title="Active Requests" value={stats?.activeRequests || 0} icon={FileText} color="amber" />
      <StatCard title="Active Complaints" value={stats?.activeComplaints || 0} icon={AlertTriangle} color="rose" />
      <StatCard title="Senior Citizens" value={stats?.seniorCitizens || 0} icon={UserCheck} color="indigo" />
      <StatCard title="PWD Count" value={stats?.pwdCount || 0} icon={Heart} color="brand" />
      <StatCard title="Announcements" value={stats?.totalAnnouncements || 0} icon={Megaphone} color="emerald" />
      <StatCard title="Upcoming Events" value={stats?.upcomingEvents || 0} icon={Calendar} color="amber" />
    </div>

    {/* Interactive GIS & Incident Map */}
    <BarangayMap />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Gender Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={charts?.genderDistribution || []} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={80} label={({ gender, count }) => `${gender}: ${count}`}>
                {(charts?.genderDistribution || []).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Population Age Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts?.ageGroups || []}>
              <XAxis dataKey="group_name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Recent Activity Feed</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {(charts?.recentActivity || []).map((act, index) => (
          <div key={index} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <span className="text-xs font-semibold uppercase text-brand-600 tracking-wider block">{act.type}</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{act.title}</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={act.status} />
              <span className="text-xs text-slate-400">{formatDate(act.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// =======================
// Resident Dashboard
// =======================
const ResidentDashboard = ({ user, stats }) => {
  const [myRequests, setMyRequests] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchResidentData = async () => {
      try {
        const [certRes, compRes, annRes] = await Promise.all([
          api.get('/certificates', { params: { limit: 5 } }),
          api.get('/complaints', { params: { limit: 5 } }),
          api.get('/announcements', { params: { limit: 3 } }),
        ]);
        if (certRes.data.success) setMyRequests(certRes.data.certificates || []);
        if (compRes.data.success) setMyComplaints(compRes.data.complaints || []);
        if (annRes.data.success) setAnnouncements(annRes.data.announcements || []);
      } catch (err) {
        console.error('Resident dashboard error:', err);
      }
    };
    fetchResidentData();
  }, []);

  const quickLinks = [
    { label: 'Request Certificate', icon: FileText, href: '/certificates', color: 'brand', desc: 'Clearance, residency & more' },
    { label: 'File a Complaint', icon: AlertTriangle, href: '/complaints', color: 'rose', desc: 'Report an incident' },
    { label: 'Request Assistance', icon: HandHeart, href: '/assistance', color: 'emerald', desc: 'Medical, financial & relief' },
    { label: 'View Events', icon: Calendar, href: '/events', color: 'amber', desc: 'Community activities' },
  ];

  const colorMap = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  const iconBg = {
    brand: 'bg-brand-100 text-brand-700',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-6 text-white shadow-lg shadow-brand-600/20">
        <p className="text-brand-100 text-sm font-medium">Welcome back,</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.firstName} {user?.lastName} 👋</h1>
        <p className="text-brand-200 text-sm mt-1">Here's a summary of your barangay services</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold">{myRequests.length}</p>
            <p className="text-xs text-brand-100">Cert. Requests</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold">{myComplaints.length}</p>
            <p className="text-xs text-brand-100">My Complaints</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold">{stats?.upcomingEvents || 0}</p>
            <p className="text-xs text-brand-100">Events</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Quick Services</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href} className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${colorMap[link.color]} hover:scale-105 transition-transform shadow-sm`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg[link.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">{link.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Certificate Requests */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">My Certificate Requests</h3>
            <Link to="/certificates" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {myRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No certificate requests yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myRequests.slice(0, 4).map(cert => (
                <div key={cert.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{cert.certificate_type}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(cert.created_at)}</p>
                  </div>
                  <StatusBadge status={cert.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Complaints */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">My Complaints</h3>
            <Link to="/complaints" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {myComplaints.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No complaints filed yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myComplaints.slice(0, 4).map(comp => (
                <div key={comp.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{comp.title || comp.complainant_name || 'Complaint'}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(comp.created_at)}</p>
                  </div>
                  <StatusBadge status={comp.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest Announcements */}
      {announcements.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Megaphone className="w-4 h-4 text-brand-500" /> Latest Announcements</h3>
            <Link to="/announcements" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {announcements.map(a => (
              <div key={a.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  {a.is_pinned && <span className="text-amber-500 text-sm mt-0.5">📌</span>}
                  <div>
                    <p className="text-sm font-bold text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(a.published_at)} • {a.author_name || 'Barangay Office'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =======================
// Main DashboardPage
// =======================
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  const isResident = user?.role === 'Resident';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          isResident ? Promise.resolve(null) : api.get('/dashboard/charts'),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (chartsRes?.data?.success) setCharts(chartsRes.data.charts);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isResident]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isResident) {
    return <ResidentDashboard user={user} stats={stats} />;
  }

  return <AdminDashboard stats={stats} charts={charts} />;
};

export default DashboardPage;
