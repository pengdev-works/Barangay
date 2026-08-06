import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Filter, Trash2, Edit, User, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    gender: 'Male',
    birth_date: '',
    civil_status: 'Single',
    address: '',
    purok: 'Purok 1',
    contact_number: '',
    email: '',
    occupation: '',
    voter_status: false,
    is_senior_citizen: false,
    is_pwd: false,
    status: 'Active',
  });

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/residents', { params: { search, status } });
      if (res.data.success) {
        setResidents(res.data.residents);
      }
    } catch (err) {
      toast.error('Failed to fetch residents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [search, status]);

  const handleOpenModal = (resident = null) => {
    if (resident) {
      setSelectedResident(resident);
      setFormData({
        first_name: resident.first_name || '',
        middle_name: resident.middle_name || '',
        last_name: resident.last_name || '',
        suffix: resident.suffix || '',
        gender: resident.gender || 'Male',
        birth_date: resident.birth_date ? resident.birth_date.split('T')[0] : '',
        civil_status: resident.civil_status || 'Single',
        address: resident.address || '',
        purok: resident.purok || 'Purok 1',
        contact_number: resident.contact_number || '',
        email: resident.email || '',
        occupation: resident.occupation || '',
        voter_status: resident.voter_status || false,
        is_senior_citizen: resident.is_senior_citizen || false,
        is_pwd: resident.is_pwd || false,
        status: resident.status || 'Active',
      });
    } else {
      setSelectedResident(null);
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        gender: 'Male',
        birth_date: '',
        civil_status: 'Single',
        address: '',
        purok: 'Purok 1',
        contact_number: '',
        email: '',
        occupation: '',
        voter_status: false,
        is_senior_citizen: false,
        is_pwd: false,
        status: 'Active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedResident) {
        await api.put(`/residents/${selectedResident.id}`, formData);
        toast.success('Resident updated successfully');
      } else {
        await api.post('/residents', formData);
        toast.success('Resident registered successfully');
      }
      setIsModalOpen(false);
      fetchResidents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resident record?')) return;
    try {
      await api.delete(`/residents/${id}`);
      toast.success('Resident deleted');
      fetchResidents();
    } catch (err) {
      toast.error('Failed to delete resident');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resident Management</h1>
          <p className="text-sm text-slate-500">Registry of all barangay residents and profile details</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Register New Resident
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resident name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Transferred">Transferred</option>
          <option value="Deceased">Deceased</option>
        </select>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Resident Name</th>
                <th className="p-4">Gender & Age</th>
                <th className="p-4">Contact & Email</th>
                <th className="p-4">Address</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading residents...</td>
                </tr>
              ) : residents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No resident records found</td>
                </tr>
              ) : (
                residents.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      {r.first_name} {r.last_name}
                    </td>
                    <td className="p-4 text-slate-600">
                      {r.gender} • {r.computed_age || r.age || 'N/A'} yrs
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="text-xs">{r.contact_number || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{r.email || ''}</div>
                    </td>
                    <td className="p-4 text-slate-600 text-xs max-w-xs truncate">{r.address}</td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(r)}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedResident ? 'Edit Resident Profile' : 'Register New Resident'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Birth Date</label>
              <input type="date" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Address *</label>
              <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
              <input type="text" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <input type="text" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={formData.is_senior_citizen} onChange={(e) => setFormData({ ...formData, is_senior_citizen: e.target.checked })} className="rounded text-brand-600" /> Senior Citizen
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={formData.is_pwd} onChange={(e) => setFormData({ ...formData, is_pwd: e.target.checked })} className="rounded text-brand-600" /> PWD
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500">Save Resident</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResidentsPage;
