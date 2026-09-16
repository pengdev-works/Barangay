import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Home, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const HouseholdsPage = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ household_number: '', address: '', purok: 'Purok 1', house_ownership: 'Owned', monthly_income: '', notes: '' });

  const fetch = async () => {
    try { setLoading(true); const r = await api.get('/households', { params: { search } }); if (r.data.success) setHouseholds(r.data.households || []); } catch { toast.error('Failed to fetch households'); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search]);

  const openModal = (h = null) => {
    setSelected(h);
    setFormData(h ? { household_number: h.household_number, address: h.address, purok: h.purok || 'Purok 1', house_ownership: h.house_ownership || 'Owned', monthly_income: h.monthly_income || '', notes: h.notes || '' } : { household_number: '', address: '', purok: 'Purok 1', house_ownership: 'Owned', monthly_income: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) { await api.put(`/households/${selected.id}`, formData); toast.success('Household updated'); }
      else { await api.post('/households', formData); toast.success('Household created'); }
      setIsModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Household Management</h1>
          <p className="text-sm text-slate-500">Register and manage barangay household records</p>
        </div>
        <button onClick={() => openModal()} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Register Household
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by number or address..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Household #</th>
                <th className="p-4">Address</th>
                <th className="p-4">Purok</th>
                <th className="p-4">Head of Family</th>
                <th className="p-4">Members</th>
                <th className="p-4">Ownership</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading households...</td></tr>
                : households.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-slate-400">No households found</td></tr>
                : households.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-brand-700">{h.household_number}</td>
                    <td className="p-4 text-slate-700 text-xs max-w-xs truncate">{h.address}</td>
                    <td className="p-4 text-slate-500 text-xs">{h.purok || 'N/A'}</td>
                    <td className="p-4 text-slate-700 font-medium">{h.head_name || <span className="text-slate-400 italic">Not set</span>}</td>
                    <td className="p-4"><span className="flex items-center gap-1 text-slate-600"><Users className="w-4 h-4" /> {h.member_count || 0}</span></td>
                    <td className="p-4"><span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">{h.house_ownership || 'N/A'}</span></td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(h)} className="px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg">Edit</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Household' : 'Register Household'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Household Number *</label><input type="text" required value={formData.household_number} onChange={e => setFormData({...formData, household_number: e.target.value})} placeholder="HH-2024-001" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Purok</label>
              <select value={formData.purok} onChange={e => setFormData({...formData, purok: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {['Purok 1','Purok 2','Purok 3','Purok 4','Purok 5'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Complete Address *</label><input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">House Ownership</label>
              <select value={formData.house_ownership} onChange={e => setFormData({...formData, house_ownership: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {['Owned','Rented','Shared','Informal Settler'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Income</label><input type="number" value={formData.monthly_income} onChange={e => setFormData({...formData, monthly_income: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500">Save Household</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HouseholdsPage;
