import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Plus, Search, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';
import { generateCertificatePDF } from '../../utils/pdfGenerator';
import { useAuth } from '../../context/AuthContext';

const CertificatesPage = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    resident_id: '',
    certificate_type: 'Barangay Clearance',
    purpose: '',
    amount: 50,
  });

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates', { params: { search, status: statusFilter } });
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (err) {
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    if (user?.role === 'Resident') return;
    try {
      const res = await api.get('/residents', { params: { limit: 100 } });
      if (res.data.success) setResidents(res.data.residents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchResidents();
  }, [search, statusFilter, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/certificates', formData);
      toast.success('Certificate request created');
      setIsModalOpen(false);
      fetchCertificates();
    } catch (err) {
      toast.error('Failed to submit request');
    }
  };

  const isStaff = user && user.role !== 'Resident';

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/certificates/${id}/status`, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchCertificates();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadPDF = async (cert) => {
    try {
      toast.loading('Generating official certificate PDF...', { id: 'pdf-toast' });
      await generateCertificatePDF(cert);
      toast.success('Certificate PDF generated successfully!', { id: 'pdf-toast' });
    } catch (err) {
      toast.error('Failed to generate PDF', { id: 'pdf-toast' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certificate Request System</h1>
          <p className="text-sm text-slate-500">Process and manage barangay clearance and document issuance</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Certificate Request
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resident name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Released">Released</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Resident</th>
                <th className="p-4">Certificate Type</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading requests...</td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No certificate requests found</td>
                </tr>
              ) : (
                certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{c.resident_name || 'Resident'}</td>
                    <td className="p-4 text-slate-700 font-medium">{c.certificate_type}</td>
                    <td className="p-4 text-slate-500 text-xs">{c.purpose}</td>
                    <td className="p-4 text-slate-400 text-xs">{formatDate(c.created_at)}</td>
                    <td className="p-4"><StatusBadge status={c.status} /></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isStaff && c.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'Approved')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'Rejected')}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {(c.status === 'Approved' || c.status === 'Released') && (
                          <button
                            onClick={async () => {
                              if (isStaff && c.status === 'Approved') {
                                await handleUpdateStatus(c.id, 'Released');
                              }
                              handleDownloadPDF(c);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> {c.status === 'Approved' ? 'Release & Print PDF' : 'Download PDF'}
                          </button>
                        )}
                        {!isStaff && c.status === 'Pending' && (
                          <span className="text-xs text-slate-400 italic">Processing</span>
                        )}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Certificate Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role === 'Resident' ? (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl">
              <label className="block text-xs font-semibold text-brand-800 mb-1">Applicant Name</label>
              <p className="text-sm font-bold text-brand-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-brand-600">{user?.email}</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Resident *</label>
              <select
                required
                value={formData.resident_id}
                onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="">-- Choose Resident --</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Type *</label>
            <select
              value={formData.certificate_type}
              onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="Barangay Clearance">Barangay Clearance</option>
              <option value="Certificate of Residency">Certificate of Residency</option>
              <option value="Certificate of Indigency">Certificate of Indigency</option>
              <option value="Business Clearance">Business Clearance</option>
              <option value="Barangay Permit">Barangay Permit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Details *</label>
            <textarea
              required
              rows="3"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. For Employment Application"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500">Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CertificatesPage;
