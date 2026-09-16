import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

const ComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Noise Disturbance', location: '', incident_date: '' });

  const fetch = async () => {
    try { setLoading(true); const r = await api.get('/complaints', { params: { search, status: statusFilter } }); if (r.data.success) setComplaints(r.data.complaints || []); } catch { toast.error('Failed to load complaints'); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/complaints', form); toast.success('Complaint filed successfully'); setIsModalOpen(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to file complaint'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try { await api.put(`/complaints/${id}/status`, { status }); toast.success(`Complaint marked as ${status}`); fetch(); }
    catch { toast.error('Failed to update status'); }
  };

  // Categories must exactly match the DB check constraint
  const categories = ['Noise Disturbance', 'Illegal Structures', 'Garbage Disposal', 'Domestic Violence', 'Theft', 'Physical Injury', 'Other'];
  const isStaff = user && user.role !== 'Resident';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaints Management</h1>
          <p className="text-sm text-slate-500">Handle and resolve community complaints and disputes</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> File Complaint
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search complainant or respondent..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500">
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Review">Under Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Title</th>
                <th className="p-4">Complainant</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date Filed</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading complaints...</td></tr>
                : complaints.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">No complaints found</td></tr>
                : complaints.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{c.complainant_name || c.title || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{c.respondent_name || c.description?.slice(0, 40) || '—'}</td>
                    <td className="p-4"><span className="px-2.5 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200">{c.category}</span></td>
                    <td className="p-4 text-slate-400 text-xs">{formatDate(c.created_at)}</td>
                    <td className="p-4"><StatusBadge status={c.status} /></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isStaff && c.status === 'Open' && <button onClick={() => handleUpdateStatus(c.id, 'Under Review')} className="px-2.5 py-1 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg">Review</button>}
                        {isStaff && (c.status === 'Open' || c.status === 'Under Review') && <button onClick={() => handleUpdateStatus(c.id, 'Resolved')} className="px-2.5 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3" />Resolve</button>}
                        {!isStaff && <span className="text-xs text-slate-400">Tracking</span>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="File a Complaint">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label><input type="text" required value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Incident Date</label><input type="date" value={form.incident_date || ''} onChange={e => setForm({...form, incident_date: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Location</label><input type="text" value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label><textarea required rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500">File Complaint</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
