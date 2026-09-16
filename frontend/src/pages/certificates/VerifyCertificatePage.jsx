import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ShieldCheck, ShieldAlert, Award, Calendar, User, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const VerifyCertificatePage = () => {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/certificates/verify/${id}`);
        if (res.data.success) {
          setCert(res.data.certificate);
        } else {
          setError(res.data.message || 'Verification record not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate record not found or QR code is invalid');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCertificate();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-slate-700/60 pb-6">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 text-brand-400 rounded-2xl border border-brand-500/20 mb-2">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Barangay Certificate Verification</h1>
          <p className="text-xs text-slate-400">Republic of the Philippines • Official Public Registry</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium">Verifying certificate authenticity...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex p-4 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-rose-400">Invalid or Unverified Certificate</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                  OFFICIALLY VERIFIED & AUTHENTIC <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                </h3>
                <p className="text-xs text-emerald-400/80">This document matches official Barangay records in the database.</p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-5 space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Certificate Type</span>
                <span className="font-bold text-brand-400 text-base">{cert.certificate_type}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Issued To</span>
                  <span className="font-bold text-slate-200 text-sm">{cert.resident_name || 'N/A'}</span>
                  {cert.resident_address && (
                    <span className="block text-slate-400 text-[11px] mt-0.5">{cert.resident_address}</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Purpose</span>
                  <span className="font-semibold text-slate-200">{cert.purpose || 'Official Legal Purpose'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date Approved</span>
                  <span className="font-semibold text-slate-300">{formatDate(cert.approved_at || cert.created_at)}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Official Receipt (O.R. No.)</span>
                  <span className="font-semibold text-slate-300">{cert.or_number || 'Official Issuance'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
                <span>Control Reference ID:</span>
                <span className="font-mono text-slate-400">{cert.id}</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-700/60 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home Page
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyCertificatePage;
