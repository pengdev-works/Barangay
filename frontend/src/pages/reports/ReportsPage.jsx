import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, FileSpreadsheet, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel } from '../../utils/excelExporter';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ReportsPage = () => {
  const [reportType, setReportType] = useState('population');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async (type) => {
    try { setLoading(true); const r = await api.get('/reports', { params: { type } }); if (r.data.success) setData(r.data.data); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(reportType); }, [reportType]);

  const renderPopulation = () => data && (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Senior Citizens', data.specialGroups?.seniors], ['PWDs', data.specialGroups?.pwds], ['Pregnant', data.specialGroups?.pregnant], ['4Ps Beneficiaries', data.specialGroups?.fourps], ['Registered Voters', data.specialGroups?.voters]].map(([label, val]) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
            <p className="text-3xl font-bold text-slate-900">{val || 0}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Gender Distribution</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.byGender} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={80} label={({ gender, count }) => `${gender}: ${count}`}>{data.byGender?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Age Group Distribution</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.byAge}><XAxis dataKey="age_group" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip /><Bar dataKey="count" fill="#0284c7" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Population by Purok</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.byPurok}><XAxis dataKey="purok" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip /><Bar dataKey="count" fill="#10b981" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );

  const renderCertificates = () => data && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">By Status</h3>
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${status}: ${count}`}>{data.byStatus?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">By Certificate Type</h3>
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.byType} layout="vertical"><XAxis type="number" stroke="#94a3b8" fontSize={11} /><YAxis dataKey="certificate_type" type="category" width={160} stroke="#94a3b8" fontSize={10} /><Tooltip /><Bar dataKey="count" fill="#0284c7" radius={[0,6,6,0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );

  const handleExportReport = async (filterType = null) => {
    try {
      toast.loading('Preparing Excel spreadsheet...', { id: 'export-toast' });
      let exportData = [];
      let filename = `Barangay_${reportType.toUpperCase()}_Report`;

      if (filterType) {
        const res = await api.get('/residents', { params: { limit: 1000, [filterType]: true } });
        if (res.data.success && res.data.residents) {
          exportData = res.data.residents.map(r => ({
            'Full Name': `${r.first_name} ${r.middle_name || ''} ${r.last_name}`,
            'Gender': r.gender,
            'Age': r.age,
            'Purok': r.purok,
            'Contact Number': r.contact_number || 'N/A',
            'Civil Status': r.civil_status,
            'Senior Citizen': r.is_senior_citizen ? 'YES' : 'NO',
            'PWD': r.is_pwd ? 'YES' : 'NO',
            '4Ps Beneficiary': r.is_4ps ? 'YES' : 'NO',
            'Registered Voter': r.voter_status ? 'YES' : 'NO'
          }));
          filename = `Barangay_${filterType.replace('is_', '').toUpperCase()}_List`;
        }
      } else if (reportType === 'population') {
        const res = await api.get('/residents', { params: { limit: 1000 } });
        if (res.data.success && res.data.residents) {
          exportData = res.data.residents.map(r => ({
            'Resident Name': `${r.first_name} ${r.last_name}`,
            'Gender': r.gender,
            'Age': r.age,
            'Civil Status': r.civil_status,
            'Purok': r.purok,
            'Occupation': r.occupation || 'N/A',
            'Monthly Income': r.monthly_income || 0,
            'Senior': r.is_senior_citizen ? 'YES' : 'NO',
            'PWD': r.is_pwd ? 'YES' : 'NO',
            '4Ps': r.is_4ps ? 'YES' : 'NO'
          }));
        }
      } else if (reportType === 'certificates') {
        const res = await api.get('/certificates', { params: { limit: 1000 } });
        if (res.data.success && res.data.certificates) {
          exportData = res.data.certificates.map(c => ({
            'Resident Name': c.resident_name,
            'Certificate Type': c.certificate_type,
            'Purpose': c.purpose,
            'Status': c.status,
            'Amount': c.amount,
            'O.R. Number': c.or_number || 'N/A',
            'Date Requested': c.created_at ? new Date(c.created_at).toLocaleDateString() : ''
          }));
        }
      } else {
        exportData = data.byGender || data.byStatus || data.byCategory || [{ Note: 'Report Summary Export', Date: new Date().toLocaleDateString() }];
      }

      if (exportData.length === 0) {
        toast.error('No records found for export', { id: 'export-toast' });
        return;
      }

      exportToExcel(exportData, filename, reportType);
      toast.success('Spreadsheet exported successfully!', { id: 'export-toast' });
    } catch (err) {
      toast.error('Failed to export data', { id: 'export-toast' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Demographic and operational data insights for decision-making</p>
        </div>
        <button
          onClick={() => handleExportReport()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export {reportType.toUpperCase()} Excel
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        {[['population', 'Population'], ['certificates', 'Certificates'], ['complaints', 'Complaints'], ['households', 'Households']].map(([type, label]) => (
          <button key={type} onClick={() => setReportType(type)} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${reportType === type ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-400 hover:text-brand-600'}`}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : !data ? (
        <div className="p-8 text-center text-slate-400">No data available</div>
      ) : (
        <>
          {reportType === 'population' && renderPopulation()}
          {reportType === 'certificates' && renderCertificates()}
          {(reportType === 'complaints' || reportType === 'households') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(data).map(([key, chartData]) => Array.isArray(chartData) && chartData.length > 0 && (
                <div key={key} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900 mb-4 capitalize">{key.replace(/([A-Z])/g, ' $1').replace('by', 'By')}</h3>
                  <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey={Object.keys(chartData[0])[0]} stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip /><Bar dataKey="count" fill="#0284c7" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
