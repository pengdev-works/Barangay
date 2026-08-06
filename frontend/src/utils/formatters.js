import { format, parseISO } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (err) {
    return dateString;
  }
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'resolved':
    case 'released':
    case 'active':
    case 'settled':
    case 'going':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'pending':
    case 'under review':
    case 'under investigation':
    case 'under mediation':
    case 'processing':
    case 'open':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'rejected':
    case 'closed':
    case 'deceased':
    case 'inactive':
    case 'not going':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'transferred':
    case 'maybe':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    default:
      return 'bg-brand-100 text-brand-800 border-brand-300';
  }
};
