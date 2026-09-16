import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

const BlotterPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const defaultForm = { complainant_name: '', respondent_name: '', incident_type: 'Physical Altercation', incident_date: '', incident_location: '', narrative: '', status: 'Under Investigation' };
  const [form, setForm] = useState(defaultForm);

  const fetch = async () => {
    try { setLoading(true); const r = await api.get('/blotter', { params: { search } }); if (r.data.success) setRecords(r.data.blotterRecords || []); } catch { toast.error('Failed to load blotter records'); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search]);

  const openModal = (rec = null) => {
    setSelected(rec);
    setForm(rec ? { complainant_name: rec.complainant_name, respondent_name: rec.respondent_name, incident_type: rec.incident_type, incident_date: rec.incident_date?.split('T')[0] || '', incident_location: rec.incident_location, narrative: rec.narrative, status: rec.status } : defaultForm);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) { await api.put(`/blotter/${selected.id}`, form); toast.success('Blotter record updated'); }
      else { await api.post('/blotter', form); toast.success('Blotter record created'); }
      setIsModalOpen(false); fetch();
    } catch (err) { toast.error('Failed to save blotter record'); }
  };

  const incidentTypes = ['Physical Altercation', 'Theft', 'Property Damage', 'Verbal Abuse', 'Domestic Violence', 'Trespassing', 'Illegal Activity', 'Other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blotter Records</h1>
          <p className="text-sm text-slate-500">Official incident and case records filed at the barangay</p>
        </div>
        <button onClick={() => openModal()} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Blotter Entry
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search complainant or respondent..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Case #</th>
                <th className="p-4">Complainant</th>
                <th className="p-4">Respondent</th>
                <th className="p-4">Incident Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading records...</td></tr>
                : records.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-slate-400">No blotter records found</td></tr>
                : records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-brand-700 text-xs">{r.blotter_number || r.id?.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 font-semibold text-slate-900">{r.complainant_name}</td>
                    <td className="p-4 text-slate-600">{r.respondent_name}</td>
                    <td className="p-4"><span className="px-2.5 py-0.5 text-xs rounded-full bg-rose-50 text-rose-700 border border-rose-200">{r.incident_type}</span></td>
                    <td className="p-4 text-slate-400 text-xs">{formatDate(r.incident_date)}</td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4 text-right"><button onClick={() => openModal(r)} className="px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg">Edit</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Update Blotter Record' : 'New Blotter Entry'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Complainant Name *</label><input type="text" required value={form.complainant_name} onChange={e => setForm({...form, complainant_name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Respondent Name *</label><input type="text" required value={form.respondent_name} onChange={e => setForm({...form, respondent_name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Incident Type</label>
              <select value={form.incident_type} onChange={e => setForm({...form, incident_type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {incidentTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Incident Date *</label><input type="date" required value={form.incident_date} onChange={e => setForm({...form, incident_date: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Location</label><input type="text" value={form.incident_location} onChange={e => setForm({...form, incident_location: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Narrative *</label><textarea required rows="4" value={form.narrative} onChange={e => setForm({...form, narrative: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            {selected && <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {['Under Investigation','Under Mediation','Settled','Closed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>}
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

export default BlotterPage;
