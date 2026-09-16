import React, { useState } from 'react';
import { MapPin, Home, AlertTriangle, Layers, Filter } from 'lucide-react';

const PUROK_ZONES = [
  { id: 'Purok 1', name: 'Purok 1 (North Zone)', color: '#0284c7', households: 42, complaints: 3, x: 25, y: 25, width: 45, height: 35 },
  { id: 'Purok 2', name: 'Purok 2 (East Zone)', color: '#10b981', households: 38, complaints: 1, x: 55, y: 15, width: 38, height: 40 },
  { id: 'Purok 3', name: 'Purok 3 (Central Poblacion)', color: '#f59e0b', households: 65, complaints: 5, x: 30, y: 55, width: 40, height: 35 },
  { id: 'Purok 4', name: 'Purok 4 (Riverside)', color: '#8b5cf6', households: 29, complaints: 2, x: 10, y: 60, width: 25, height: 32 },
  { id: 'Purok 5', name: 'Purok 5 (South Zone)', color: '#ec4899', households: 51, complaints: 4, x: 65, y: 58, width: 30, height: 35 },
];

const SAMPLE_INCIDENTS = [
  { id: 1, title: 'Noise Disturbance', purok: 'Purok 3', category: 'Noise', status: 'Pending', x: 45, y: 65 },
  { id: 2, title: 'Illegal Garbage Dumping', purok: 'Purok 1', category: 'Garbage', status: 'Under Investigation', x: 35, y: 35 },
  { id: 3, title: 'Streetlight Maintenance', purok: 'Purok 5', category: 'Other', status: 'Resolved', x: 75, y: 72 },
  { id: 4, title: 'Drainage Blockage', purok: 'Purok 2', category: 'Infrastructure', status: 'Pending', x: 68, y: 30 },
];

const BarangayMap = () => {
  const [selectedPurok, setSelectedPurok] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidents, setShowIncidents] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" /> Interactive Barangay GIS & Incident Map
          </h2>
          <p className="text-xs text-slate-500">Spatial distribution of households and reported incidents across Purok zones</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showIncidents ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> {showIncidents ? 'Hide Incidents' : 'Show Incidents'}
          </button>
        </div>
      </div>

      {/* SVG GIS Map Viewer */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full select-none">
          {/* Background grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Render Purok Boundaries */}
          {PUROK_ZONES.map((zone) => {
            const isSelected = selectedPurok?.id === zone.id;
            return (
              <g
                key={zone.id}
                onClick={() => {
                  setSelectedPurok(zone);
                  setSelectedIncident(null);
                }}
                className="cursor-pointer transition-all duration-300 hover:opacity-90"
              >
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="3"
                  fill={zone.color}
                  fillOpacity={isSelected ? '0.35' : '0.18'}
                  stroke={zone.color}
                  strokeWidth={isSelected ? '0.8' : '0.4'}
                  strokeDasharray={isSelected ? 'none' : '1.5 1.5'}
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2 - 1}
                  fill="#ffffff"
                  fontSize="2.8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow"
                >
                  {zone.id}
                </text>
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2 + 3}
                  fill="#94a3b8"
                  fontSize="2"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {zone.households} Households
                </text>
              </g>
            );
          })}

          {/* Incident Pins */}
          {showIncidents &&
            SAMPLE_INCIDENTS.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <g
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncident(inc);
                    setSelectedPurok(null);
                  }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={inc.x}
                    cy={inc.y}
                    r={isSelected ? '3.5' : '2.2'}
                    fill={inc.status === 'Resolved' ? '#10b981' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth="0.5"
                    className="animate-pulse"
                  />
                  <text
                    x={inc.x}
                    y={inc.y - 3}
                    fill="#fbbf24"
                    fontSize="2"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="drop-shadow"
                  >
                    ⚠️
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Floating Detail Overlay */}
        {(selectedPurok || selectedIncident) && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-slate-900/95 border border-slate-700/90 text-white p-4 rounded-xl shadow-xl backdrop-blur-md space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-brand-400 flex items-center gap-1.5">
                {selectedPurok ? <Home className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                {selectedPurok ? selectedPurok.name : selectedIncident.title}
              </h3>
              <button
                onClick={() => {
                  setSelectedPurok(null);
                  setSelectedIncident(null);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold px-1.5"
              >
                ✕
              </button>
            </div>

            {selectedPurok && (
              <div className="text-xs space-y-1 text-slate-300">
                <p>📍 Registered Households: <span className="font-bold text-white">{selectedPurok.households}</span></p>
                <p>⚠️ Reported Incidents: <span className="font-bold text-amber-400">{selectedPurok.complaints} active</span></p>
              </div>
            )}

            {selectedIncident && (
              <div className="text-xs space-y-1 text-slate-300">
                <p>📍 Zone: <span className="font-bold text-white">{selectedIncident.purok}</span></p>
                <p>Category: <span className="font-semibold text-slate-200">{selectedIncident.category}</span></p>
                <p>Status: <span className="font-bold text-emerald-400">{selectedIncident.status}</span></p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-brand-500/30 border border-brand-500 inline-block"></span> Purok Zones
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Active Incidents
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Resolved Complaints
          </span>
        </div>
        <span>Click any zone or pin on the map to inspect details</span>
      </div>
    </div>
  );
};

export default BarangayMap;
