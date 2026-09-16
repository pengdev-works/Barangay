import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

import { useAuth } from '../../context/AuthContext';

const HealthPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState({ resident_id: '', record_type: 'Check-up', date_of_service: '', health_facility: '', attending_health_worker: '', diagnosis: '', medications: '', notes: '', follow_up_date: '' });

  const fetchRecords = async () => {
    try { setLoading(true); const r = await api.get('/health', { params: { search } }); if (r.data.success) setRecords(r.data.records || []); } catch { toast.error('Failed to load health records'); } finally { setLoading(false); }
  };

  const fetchResidents = async () => {
    if (user?.role === 'Resident') return;
    try { const r = await api.get('/residents', { params: { limit: 200 } }); if (r.data.success) setResidents(r.data.residents || []); } catch { }
  };

  useEffect(() => { fetchRecords(); fetchResidents(); }, [search, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/health', form); toast.success('Health record added'); setIsModalOpen(false); fetchRecords(); }
    catch (err) { toast.error('Failed to add record'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health Monitoring</h1>
          <p className="text-sm text-slate-500">Track vaccinations, check-ups, and health services for residents</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Health Record
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search resident or health worker..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Resident</th>
                <th className="p-4">Record Type</th>
                <th className="p-4">Facility</th>
                <th className="p-4">Diagnosis / Notes</th>
                <th className="p-4">Date of Service</th>
                <th className="p-4">Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading health records...</td></tr>
                : records.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">No health records found</td></tr>
                : records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{r.resident_name || 'Unknown'}</td>
                    <td className="p-4"><span className="px-2.5 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{r.record_type}</span></td>
                    <td className="p-4 text-slate-600 text-xs">{r.health_facility || 'N/A'}</td>
                    <td className="p-4 text-slate-500 text-xs max-w-xs truncate">{r.diagnosis || r.notes || '—'}</td>
                    <td className="p-4 text-slate-400 text-xs">{formatDate(r.date_of_service)}</td>
                    <td className="p-4 text-xs">{r.follow_up_date ? <span className="text-amber-600 font-medium">{formatDate(r.follow_up_date)}</span> : <span className="text-slate-300">—</span>}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Health Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Resident *</label>
              <select required value={form.resident_id} onChange={e => setForm({...form, resident_id: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option value="">-- Select Resident --</option>
                {residents.map(r => <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Record Type</label>
              <select value={form.record_type} onChange={e => setForm({...form, record_type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {['Vaccination','Check-up','Prenatal','Senior Check-up','PWD Assessment','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Date of Service *</label><input type="date" required value={form.date_of_service} onChange={e => setForm({...form, date_of_service: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Health Facility</label><input type="text" value={form.health_facility} onChange={e => setForm({...form, health_facility: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Health Worker</label><input type="text" value={form.attending_health_worker} onChange={e => setForm({...form, attending_health_worker: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis</label><textarea rows="2" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Date</label><input type="date" value={form.follow_up_date} onChange={e => setForm({...form, follow_up_date: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500">Save Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HealthPage;
