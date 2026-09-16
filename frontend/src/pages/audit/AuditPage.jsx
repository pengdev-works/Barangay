import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import { Search, ShieldAlert } from 'lucide-react';

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetch = async () => {
    try { setLoading(true); const r = await api.get('/audit', { params: { action, page, limit: 20 } }); if (r.data.success) { setLogs(r.data.logs); setPagination(r.data.pagination); } }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [action, page]);

  const actionColor = (a) => {
    if (a?.includes('LOGIN')) return 'bg-brand-50 text-brand-700 border-brand-200';
    if (a?.includes('CREATE') || a?.includes('INSERT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (a?.includes('UPDATE') || a?.includes('CHANGE')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (a?.includes('DELETE')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-sm text-slate-500">Full log of all system actions and user activities</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
          <ShieldAlert className="w-4 h-4" /> Super Admin Only
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Filter by action (e.g. LOGIN, CREATE)" value={action} onChange={e => setAction(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Table</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading audit logs...</td></tr>
                : logs.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-400">No audit logs found</td></tr>
                : logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(log.created_at, 'MMM dd, yyyy hh:mm a')}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 text-xs">{log.user_name || 'System'}</p>
                      <p className="text-[10px] text-slate-400">{log.user_email}</p>
                    </td>
                    <td className="p-4"><span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${actionColor(log.action)}`}>{log.action}</span></td>
                    <td className="p-4 text-xs text-slate-500">{log.table_name || '—'}</td>
                    <td className="p-4 text-xs text-slate-400 font-mono">{log.ip_address || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)</p>
            <div className="flex gap-2">
              <button disabled={pagination.page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:border-brand-400">Previous</button>
              <button disabled={pagination.page === pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:border-brand-400">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPage;
