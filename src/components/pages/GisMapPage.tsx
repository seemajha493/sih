import React, { useState } from 'react';
import { Map, ZoomIn, ZoomOut, MapPin, Search, Layers, X, CheckCircle, AlertTriangle, Clock, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_LAND_RECORDS } from '../../mockData/mockData';

interface GISParcel {
  khasraNo: string;
  recordId: string;
  ownerName: string;
  area: string;
  status: string;
  district: string;
  village: string;
  points: string;
  labelX: number;
  labelY: number;
  centroidX: number;
  centroidY: number;
}

const PARCELS: GISParcel[] = [
  {
    khasraNo: '452/1', recordId: 'LR-1024', ownerName: 'Ramesh Chand Sharma',
    area: '3.45 Acres', status: 'VERIFIED', district: 'Jaipur Rural', village: 'Rampur',
    points: '80,60 240,70 230,200 70,185', labelX: 140, labelY: 130, centroidX: 155, centroidY: 129,
  },
  {
    khasraNo: '109/B', recordId: 'LR-1025', ownerName: 'Sunita Devi',
    area: '1.20 Acres', status: 'PENDING_VERIFICATION', district: 'Jaipur Rural', village: 'Kishanpura',
    points: '250,65 380,55 375,175 245,185', labelX: 305, labelY: 120, centroidX: 313, centroidY: 120,
  },
  {
    khasraNo: '77/3', recordId: 'LR-1026', ownerName: 'Mahesh Singh & Bros',
    area: '7.80 Acres', status: 'LOW_CONFIDENCE', district: 'Jaipur Rural', village: 'Phagi Central',
    points: '385,50 570,40 560,190 380,200', labelX: 465, labelY: 120, centroidX: 474, centroidY: 120,
  },
  {
    khasraNo: '312/8', recordId: 'LR-1028', ownerName: 'Govt of Rajasthan (Panchayat)',
    area: '14.50 Acres', status: 'VERIFIED', district: 'Jaipur Rural', village: 'Bagru',
    points: '80,210 350,205 340,360 70,365', labelX: 195, labelY: 285, centroidX: 210, centroidY: 285,
  },
  {
    khasraNo: '55/2A', recordId: 'LR-1030', ownerName: 'Ghanshyam Lal Meena',
    area: '2.10 Acres', status: 'VERIFIED', district: 'Jaipur Rural', village: 'Nangal Jaisa',
    points: '360,210 510,200 500,330 350,340', labelX: 430, labelY: 270, centroidX: 430, centroidY: 268,
  },
  {
    khasraNo: '188/4', recordId: 'LR-1031', ownerName: 'Bajrangi Lal Soni',
    area: '0.85 Acres', status: 'ANOMALY_DETECTED', district: 'Jaipur Rural', village: 'Chaksu Khurd',
    points: '520,195 660,185 650,305 510,315', labelX: 580, labelY: 250, centroidX: 585, centroidY: 250,
  },
  {
    khasraNo: '89/1', recordId: 'LR-1029', ownerName: 'Harish Chandra',
    area: '2.15 Acres', status: 'PENDING_VERIFICATION', district: 'Patna', village: 'Danapur',
    points: '670,50 780,45 775,170 660,175', labelX: 715, labelY: 110, centroidX: 718, centroidY: 108,
  },
];

const STATUS_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  VERIFIED:             { fill: 'rgba(21, 128, 61, 0.45)',   stroke: '#15803D', label: 'Verified'       },
  PENDING_VERIFICATION: { fill: 'rgba(180, 83, 9, 0.35)',    stroke: '#B45309', label: 'Pending'        },
  LOW_CONFIDENCE:       { fill: 'rgba(239, 68, 68, 0.35)',   stroke: '#EF4444', label: 'Low Confidence' },
  DUPLICATE:            { fill: 'rgba(99, 102, 241, 0.35)',  stroke: '#6366F1', label: 'Duplicate'      },
  ANOMALY_DETECTED:     { fill: 'rgba(185, 28, 28, 0.45)',   stroke: '#B91C1C', label: 'Anomaly'        },
};

export const GisMapPage: React.FC = () => {
  const { user } = useAuth();
  const isPublicUser = user?.role === 'PUBLIC_USER';

  const [activeLayer, setActiveLayer] = useState<'cadastral' | 'satellite'>('cadastral');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const userAuthorizedParcels = React.useMemo(() => {
    if (!isPublicUser) return PARCELS;
    return PARCELS.filter(p => {
      const rec = MOCK_LAND_RECORDS.find(r => r.id === p.recordId);
      return rec?.associatedUserId === user?.id;
    });
  }, [isPublicUser, user]);

  const [selectedParcel, setSelectedParcel] = useState<GISParcel | null>(
    isPublicUser && userAuthorizedParcels.length > 0 ? userAuthorizedParcels[0] : PARCELS[0]
  );

  const filteredParcels = userAuthorizedParcels.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.khasraNo.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q) || p.village.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    if (status === 'VERIFIED') return <CheckCircle className="w-3 h-3 text-emerald-600" />;
    if (status === 'ANOMALY_DETECTED') return <AlertTriangle className="w-3 h-3 text-red-600" />;
    return <Clock className="w-3 h-3 text-amber-600" />;
  };

  if (isPublicUser && userAuthorizedParcels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded border border-slate-200 mt-10 max-w-2xl mx-auto shadow-sm text-center">
        <Lock className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">My Land Map Unavailable</h2>
        <p className="text-slate-600">
          This land parcel is not available for your account. You can only view GIS information for land records authorized to you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* Header */}
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-5 h-5 text-[#1B365D]" /> {isPublicUser ? 'My Land Map' : 'GIS Cadastral Map Viewer'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isPublicUser ? 'View the map location and boundaries of your authorized land record.' : 'NIC Bhuvan 2.0 Integration — Spatial Parcel Coordinate & Boundary Verification'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['cadastral', 'satellite'] as const).map(l => (
            <button key={l} onClick={() => setActiveLayer(l)}
              className={`text-xs font-bold px-3 py-1.5 rounded uppercase flex items-center gap-1 transition ${
                activeLayer === l ? 'bg-[#1B365D] text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}>
              <Layers className="w-3 h-3" /> {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Search + Parcel list */}
        <div className="lg:col-span-3 space-y-3">
          {/* Search */}
          {!isPublicUser && (
            <div className="gov-card p-3 rounded border border-slate-300">
              <div className="relative">
                <input
                  type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Khasra No, Village…"
                  className="w-full bg-slate-50 text-xs rounded pl-7 pr-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#1B365D]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {['ALL', 'VERIFIED', 'PENDING_VERIFICATION', 'ANOMALY_DETECTED'].map(st => (
                  <button key={st} onClick={() => setStatusFilter(st)}
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold border transition ${
                      statusFilter === st ? 'bg-[#1B365D] text-white border-[#002B49]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}>
                    {st === 'ALL' ? 'All' : st.replace(/_/g, ' ').replace('VERIFICATION', 'VER.')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parcel list */}
          <div className="gov-card p-3 rounded border border-slate-300">
            <div className="text-[10px] font-bold uppercase text-slate-600 mb-2 pb-1 border-b border-slate-200">
              Parcels ({filteredParcels.length})
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {filteredParcels.map(p => {
                return (
                  <button key={p.khasraNo} onClick={() => setSelectedParcel(p)}
                    className={`w-full text-left p-2 rounded border text-xs transition ${
                      selectedParcel?.khasraNo === p.khasraNo
                        ? 'border-[#1B365D] bg-slate-100'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {getStatusIcon(p.status)}
                      <span className="font-mono font-bold text-slate-900">Khasra {p.khasraNo}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 truncate">{p.ownerName}</div>
                    <div className="text-[10px] text-slate-500">{p.village} · {p.area}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="gov-card p-3 rounded border border-slate-300 text-xs">
            <div className="text-[10px] font-bold uppercase text-slate-600 mb-2 pb-1 border-b border-slate-200">Legend</div>
            {Object.entries(STATUS_COLORS).map(([st, col]) => (
              <div key={st} className="flex items-center gap-2 mb-1">
                <div className="w-4 h-3 rounded-sm border" style={{ backgroundColor: col.fill, borderColor: col.stroke }} />
                <span className="text-[11px] text-slate-700">{col.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Map canvas */}
        <div className="lg:col-span-9 space-y-3">
          <div className="gov-card rounded border border-slate-300 overflow-hidden relative">
            {/* Map area */}
            <div
              className="relative overflow-hidden"
              style={{
                background: activeLayer === 'satellite'
                  ? 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 30%, #3a5c3a 60%, #2d4a2d 100%)'
                  : 'linear-gradient(135deg, #E8F4F0 0%, #D4E9E0 40%, #C8DED2 100%)',
                height: '420px',
              }}
            >
              {/* Grid overlay for cadastral */}
              {activeLayer === 'cadastral' && (
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#4B6B5533_1px,transparent_1px),linear-gradient(90deg,#4B6B5533_1px,transparent_1px)] bg-[size:40px_40px]" />
              )}

              {/* SVG parcels */}
              <svg className="w-full h-full" viewBox="0 0 850 440" preserveAspectRatio="xMidYMid meet"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.3s' }}>

                {/* Road/canal lines */}
                <path d="M 0,230 Q 300,220 500,225 Q 650,228 850,230" fill="none"
                  stroke={activeLayer === 'satellite' ? '#4ADE80' : '#94A3B8'} strokeWidth="6" strokeDasharray="12 4" opacity="0.5" />
                <text x="200" y="218" fill={activeLayer === 'satellite' ? '#4ADE80' : '#64748B'} fontSize="10" fontWeight="bold">
                  NH-48 / State Highway
                </text>

                {/* Water body */}
                <ellipse cx="420" cy="390" rx="80" ry="22" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" opacity="0.8" />
                <text x="385" y="394" fill="#2563EB" fontSize="9" fontWeight="bold">Rampur Talab</text>

                {/* Render parcels */}
                {userAuthorizedParcels.map(parcel => {
                  const col = STATUS_COLORS[parcel.status] ?? STATUS_COLORS.PENDING_VERIFICATION;
                  const isSelected = selectedParcel?.khasraNo === parcel.khasraNo;
                  const isFiltered = !filteredParcels.find(p => p.khasraNo === parcel.khasraNo);
                  return (
                    <g key={parcel.khasraNo} onClick={() => setSelectedParcel(parcel)} className="cursor-pointer">
                      <polygon
                        points={parcel.points}
                        fill={isFiltered ? 'rgba(100,116,139,0.1)' : col.fill}
                        stroke={isSelected ? '#FBBF24' : col.stroke}
                        strokeWidth={isSelected ? 3 : 1.5}
                        opacity={isFiltered ? 0.3 : 1}
                        style={{ transition: 'all 0.2s' }}
                      />
                      {!isFiltered && (
                        <>
                          <text x={parcel.labelX} y={parcel.labelY - 6} textAnchor="middle"
                            fill={activeLayer === 'satellite' ? '#fff' : '#1E293B'} fontSize="10" fontWeight="bold">
                            {parcel.khasraNo}
                          </text>
                          <text x={parcel.labelX} y={parcel.labelY + 8} textAnchor="middle"
                            fill={activeLayer === 'satellite' ? '#CBD5E1' : '#475569'} fontSize="9">
                            {parcel.area}
                          </text>
                        </>
                      )}
                      {isSelected && (
                        <circle cx={parcel.centroidX} cy={parcel.centroidY - 20} r="5" fill="#FBBF24" stroke="white" strokeWidth="2" />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Coordinate display */}
              <div className="absolute top-3 left-3 bg-slate-900/85 border border-slate-700 text-white p-2 rounded text-xs space-y-0.5">
                <div className="font-bold text-amber-400 text-[11px]">Bhuvan Geo-Server Node</div>
                <div className="font-mono text-[10px] text-slate-300">Lat: 26.8124° N, Lon: 75.8012° E</div>
                <div className="font-mono text-[10px] text-slate-400">Zoom: ×{zoom.toFixed(1)} | CRS: WGS84</div>
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
                <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                  className="p-1.5 bg-slate-900 text-white rounded border border-slate-700 hover:bg-slate-800">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={() => setZoom(1)}
                  className="p-1.5 bg-slate-900 text-white rounded border border-slate-700 hover:bg-slate-800 text-[9px] font-bold">1:1</button>
                <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                  className="p-1.5 bg-slate-900 text-white rounded border border-slate-700 hover:bg-slate-800">
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>

              {/* Layer badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-700 uppercase">
                  {activeLayer} Layer
                </span>
              </div>
            </div>

            {/* Selected parcel info bar */}
            {selectedParcel && (
              <div className="p-3 bg-[#1B365D] text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold">Khasra #{selectedParcel.khasraNo}</span>
                    <span className="mx-2 text-slate-400">·</span>
                    <span className="text-slate-300">{selectedParcel.village}, {selectedParcel.district}</span>
                    <span className="mx-2 text-slate-400">·</span>
                    <span className="text-slate-300">Owner: {selectedParcel.ownerName}</span>
                    <span className="mx-2 text-slate-400">·</span>
                    <span className="text-slate-300">{selectedParcel.area}</span>
                    <span className="mx-2 text-slate-400">·</span>
                    <span className={`font-bold ${selectedParcel.status === 'VERIFIED' ? 'text-emerald-400' : selectedParcel.status.includes('ANOMALY') ? 'text-red-400' : 'text-amber-400'}`}>
                      {selectedParcel.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="gov-btn-primary py-1 px-3 text-[11px]">Inspect Boundary</button>
                  <button onClick={() => setSelectedParcel(null)} className="p-1 hover:bg-slate-700 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Note about GIS integration */}
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-2.5">
            <strong>Note:</strong> This is a demonstration using placeholder parcels. Real cadastral boundaries would be rendered from the DoLR GIS API / NIC Bhuvan cadastral layer. Code is structured for PostGIS + GeoJSON API integration.
          </div>
        </div>
      </div>
    </div>
  );
};
