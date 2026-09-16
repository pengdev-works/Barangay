import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Plus, Search, CheckCircle, XCircle, HandHeart } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

const AssistancePage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState({ resident_id: '', assistance_type: 'Medical', description: '', amount_requested: '' });

  const fetchRequests = async () => {
    try { setLoading(true); const r = await api.get('/assistance', { params: { status: statusFilter } }); if (r.data.success) setRequests(r.data.requests || []); } catch { toast.error('Failed to load assistance requests'); } finally { setLoading(false); }
  };
  const fetchResidents = async () => {
    if (user?.role === 'Resident') return;
    try { const r = await api.get('/residents', { params: { limit: 200 } }); if (r.data.success) setResidents(r.data.residents || []); } catch { }
  };

  useEffect(() => { fetchRequests(); fetchResidents(); }, [statusFilter, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/assistance', form); toast.success('Assistance request submitted'); setIsModalOpen(false); fetchRequests(); }
    catch (err) { toast.error('Failed to submit request'); }
  };

  const handleUpdateStatus = async (id, status, amount_approved = null) => {
    try { await api.put(`/assistance/${id}/status`, { status, amount_approved }); toast.success(`Request ${status.toLowerCase()}`); fetchRequests(); }
    catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emergency Assistance</h1>
          <p className="text-sm text-slate-500">Manage financial, medical, and disaster relief requests from residents</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Assistance Request
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Released">Released</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Resident</th>
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount Requested</th>
                <th className="p-4">Amount Approved</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading requests...</td></tr>
                : requests.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-slate-400">No assistance requests found</td></tr>
                : requests.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{r.resident_name || 'N/A'}</td>
                    <td className="p-4"><span className="px-2.5 py-0.5 text-xs rounded-full bg-brand-50 text-brand-700 border border-brand-200">{r.assistance_type}</span></td>
                    <td className="p-4 text-slate-500 text-xs max-w-xs truncate">{r.description}</td>
                    <td className="p-4 text-slate-700 font-medium">{r.amount_requested ? formatCurrency(r.amount_requested) : '—'}</td>
                    <td className="p-4 text-emerald-700 font-semibold">{r.amount_approved ? formatCurrency(r.amount_approved) : '—'}</td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === 'Pending' && <>
                          <button onClick={() => handleUpdateStatus(r.id, 'Approved')} className="px-2.5 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3" />Approve</button>
                          <button onClick={() => handleUpdateStatus(r.id, 'Rejected')} className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"><XCircle className="w-3 h-3 inline mr-1" />Reject</button>
                        </>}
                        {r.status === 'Approved' && <button onClick={() => handleUpdateStatus(r.id, 'Released')} className="px-2.5 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg">Mark Released</button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Assistance Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role === 'Resident' ? (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl">
              <label className="block text-xs font-semibold text-brand-800 mb-1">Applicant Name</label>
              <p className="text-sm font-bold text-brand-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-brand-600">{user?.email}</p>
            </div>
          ) : (
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Resident *</label>
              <select required value={form.resident_id} onChange={e => setForm({...form, resident_id: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option value="">-- Select Resident --</option>
                {residents.map(r => <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Assistance Type</label>
              <select value={form.assistance_type} onChange={e => setForm({...form, assistance_type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {['Medical','Financial','Disaster Relief','Food','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Amount Requested (₱)</label><input type="number" value={form.amount_requested} onChange={e => setForm({...form, amount_requested: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-700 mb-1">Situation Description *</label><textarea required rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500">Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssistancePage;
