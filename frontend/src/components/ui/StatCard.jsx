import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'brand', trend }) => {
  const colorMap = {
    brand: 'bg-brand-500 text-white shadow-brand-500/20',
    emerald: 'bg-emerald-500 text-white shadow-emerald-500/20',
    amber: 'bg-amber-500 text-white shadow-amber-500/20',
    rose: 'bg-rose-500 text-white shadow-rose-500/20',
    indigo: 'bg-indigo-500 text-white shadow-indigo-500/20',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
          {trend && (
            <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
              <span>↑ {trend}</span>
              <span className="text-slate-400">vs last month</span>
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl shadow-lg ${colorMap[color] || colorMap.brand}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
