import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate } from '../utils/formatters';
import { Users, Home, FileText, AlertTriangle, Heart, UserCheck, Megaphone, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/charts'),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (chartsRes.data.success) setCharts(chartsRes.data.charts);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Barangay Dashboard</h1>
        <p className="text-sm text-slate-500">Real-time demographic and operational metrics</p>
      </div>

      {/* KPI Grid */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Gender Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.genderDistribution || []}
                  dataKey="count"
                  nameKey="gender"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ gender, count }) => `${gender}: ${count}`}
                >
                  {(charts?.genderDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Groups Chart */}
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

      {/* Recent Activity Table */}
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
};

export default DashboardPage;
