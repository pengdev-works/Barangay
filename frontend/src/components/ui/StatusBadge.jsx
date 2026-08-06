import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  
  const getStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'approved':
      case 'resolved':
      case 'released':
      case 'active':
      case 'settled':
      case 'going':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'pending':
      case 'under review':
      case 'under investigation':
      case 'under mediation':
      case 'processing':
      case 'open':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'rejected':
      case 'closed':
      case 'deceased':
      case 'inactive':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20';
      default:
        return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStyle(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
