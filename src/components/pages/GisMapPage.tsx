import React, { useState, useMemo } from 'react';
import {
  Map,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  MapPin,
  Search,
  Layers,
  Lock,
  FileText,
  Compass,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_LAND_RECORDS } from '../../mockData/mockData';

export interface CadastralParcel {
  khasraNo: string;
  recordId: string;
  ownerName: string;
  area: string;
  status: 'VERIFIED' | 'PENDING_VERIFICATION' | 'LOW_CONFIDENCE' | 'ANOMALY_DETECTED' | 'DUPLICATE';
  district: string;
  tehsil: string;
  village: string;
  state: string;
  lastUpdated: string;
  verificationStatus: string;
  points: string;
  centroidX: number;
  centroidY: number;
  vertices: { label: string; lat: string; lon: string }[];
  adjacentParcels: string[];
}

// ─── REALISTIC CONTIGUOUS CADASTRAL SURVEY PARCELS (RAMPUR REVENUE VILLAGE) ──
const CADASTRAL_PARCELS: CadastralParcel[] = [
  {
    khasraNo: '452/1',
    recordId: 'LR-1024',
    ownerName: 'Ramesh Chand Sharma',
    area: '3.45 Acres',
    status: 'VERIFIED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Rampur Mauza',
    state: 'Rajasthan',
    lastUpdated: '06 Sep 2026',
    verificationStatus: 'Authorized & Verified by Tehsildar',
    points: '60,40 180,48 170,160 52,145',
    centroidX: 115,
    centroidY: 98,
    vertices: [
      { label: 'A', lat: '26.8142° N', lon: '75.8012° E' },
      { label: 'B', lat: '26.8145° N', lon: '75.8035° E' },
      { label: 'C', lat: '26.8123° N', lon: '75.8031° E' },
      { label: 'D', lat: '26.8120° N', lon: '75.8009° E' },
    ],
    adjacentParcels: ['452/2', '109/A', '312/1'],
  },
  {
    khasraNo: '452/2',
    recordId: 'LR-1033',
    ownerName: 'Vikramaditya Rathore',
    area: '2.10 Acres',
    status: 'VERIFIED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Rampur Mauza',
    state: 'Rajasthan',
    lastUpdated: '04 Sep 2026',
    verificationStatus: 'Authorized & Verified by Tehsildar',
    points: '180,48 290,42 280,152 170,160',
    centroidX: 230,
    centroidY: 100,
    vertices: [
      { label: 'B', lat: '26.8145° N', lon: '75.8035° E' },
      { label: 'E', lat: '26.8148° N', lon: '75.8058° E' },
      { label: 'F', lat: '26.8126° N', lon: '75.8054° E' },
      { label: 'C', lat: '26.8123° N', lon: '75.8031° E' },
    ],
    adjacentParcels: ['452/1', '109/B', '453'],
  },
  {
    khasraNo: '453',
    recordId: 'LR-1034',
    ownerName: 'Kailash Nath Verma',
    area: '4.20 Acres',
    status: 'VERIFIED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Rampur Mauza',
    state: 'Rajasthan',
    lastUpdated: '02 Sep 2026',
    verificationStatus: 'Authorized & Verified by Tehsildar',
    points: '290,42 420,35 410,145 280,152',
    centroidX: 350,
    centroidY: 95,
    vertices: [
      { label: 'E', lat: '26.8148° N', lon: '75.8058° E' },
      { label: 'G', lat: '26.8152° N', lon: '75.8082° E' },
      { label: 'H', lat: '26.8129° N', lon: '75.8078° E' },
      { label: 'F', lat: '26.8126° N', lon: '75.8054° E' },
    ],
    adjacentParcels: ['452/2', '77/1', '109/B'],
  },
  {
    khasraNo: '109/A',
    recordId: 'LR-1035',
    ownerName: 'Geeta Devi & Sons',
    area: '1.80 Acres',
    status: 'VERIFIED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Rampur Mauza',
    state: 'Rajasthan',
    lastUpdated: '05 Sep 2026',
    verificationStatus: 'Authorized & Verified by Tehsildar',
    points: '52,145 170,160 160,255 45,240',
    centroidX: 106,
    centroidY: 200,
    vertices: [
      { label: 'D', lat: '26.8120° N', lon: '75.8009° E' },
      { label: 'C', lat: '26.8123° N', lon: '75.8031° E' },
      { label: 'I', lat: '26.8101° N', lon: '75.8028° E' },
      { label: 'J', lat: '26.8098° N', lon: '75.8005° E' },
    ],
    adjacentParcels: ['452/1', '109/B', '312/1'],
  },
  {
    khasraNo: '109/B',
    recordId: 'LR-1025',
    ownerName: 'Sunita Devi',
    area: '1.20 Acres',
    status: 'PENDING_VERIFICATION',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Kishanpura',
    state: 'Rajasthan',
    lastUpdated: '01 Sep 2026',
    verificationStatus: 'Pending Revenue Officer Verification',
    points: '170,160 280,152 270,250 160,255',
    centroidX: 220,
    centroidY: 204,
    vertices: [
      { label: 'C', lat: '26.8123° N', lon: '75.8031° E' },
      { label: 'F', lat: '26.8126° N', lon: '75.8054° E' },
      { label: 'K', lat: '26.8104° N', lon: '75.8050° E' },
      { label: 'I', lat: '26.8101° N', lon: '75.8028° E' },
    ],
    adjacentParcels: ['109/A', '452/2', '77/1', '312/8'],
  },
  {
    khasraNo: '77/1',
    recordId: 'LR-1036',
    ownerName: 'Bhagwan Sahai Gurjar',
    area: '3.10 Acres',
    status: 'VERIFIED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Phagi Central',
    state: 'Rajasthan',
    lastUpdated: '07 Sep 2026',
    verificationStatus: 'Authorized & Verified by Tehsildar',
    points: '280,152 410,145 400,245 270,250',
    centroidX: 340,
    centroidY: 198,
    vertices: [
      { label: 'F', lat: '26.8126° N', lon: '75.8054° E' },
      { label: 'H', lat: '26.8129° N', lon: '75.8078° E' },
      { label: 'L', lat: '26.8107° N', lon: '75.8075° E' },
      { label: 'K', lat: '26.8104° N', lon: '75.8050° E' },
    ],
    adjacentParcels: ['109/B', '453', '77/2', '312/8'],
  },
  {
    khasraNo: '77/2',
    recordId: 'LR-1037',
    ownerName: 'Chunni Lal Meena',
    area: '2.40 Acres',
    status: 'ANOMALY_DETECTED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Phagi Central',
    state: 'Rajasthan',
    lastUpdated: '03 Sep 2026',
    verificationStatus: 'Boundary Area Discrepancy Flagged',
    points: '410,145 530,135 520,240 400,245',
    centroidX: 465,
    centroidY: 191,
    vertices: [
      { label: 'H', lat: '26.8129° N', lon: '75.8078° E' },
      { label: 'M', lat: '26.8133° N', lon: '75.8102° E' },
      { label: 'N', lat: '26.8110° N', lon: '75.8098° E' },
      { label: 'L', lat: '26.8107° N', lon: '75.8075° E' },
    ],
    adjacentParcels: ['77/1', '77/3', '55/2A'],
  },
  {
    khasraNo: '77/3',
    recordId: 'LR-1026',
    ownerName: 'Mahesh Singh & Bros',
    area: '7.80 Acres',
    status: 'LOW_CONFIDENCE',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Phagi Central',
    state: 'Rajasthan',
    lastUpdated: '28 Aug 2026',
    verificationStatus: 'Low OCR Confidence on Khasra Number',
    points: '420,35 620,25 610,185 530,135 410,145',
    centroidX: 518,
    centroidY: 85,
    vertices: [
      { label: 'G', lat: '26.8152° N', lon: '75.8082° E' },
      { label: 'O', lat: '26.8156° N', lon: '75.8125° E' },
      { label: 'P', lat: '26.8121° N', lon: '75.8120° E' },
      { label: 'M', lat: '26.8133° N', lon: '75.8102° E' },
    ],
    adjacentParcels: ['453', '77/2', '188/4'],
  },
  {
    khasraNo: '312/1',
    recordId: 'LR-1038',
    ownerName: 'Devi Lal Kumawat',
    area: '5.60 Acres',
    status: 'VERIFIED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Bagru Khurd',
    state: 'Rajasthan',
    lastUpdated: '08 Sep 2026',
    verificationStatus: 'Authorized & Verified by Tehsildar',
    points: '45,240 160,255 150,380 35,365',
    centroidX: 98,
    centroidY: 310,
    vertices: [
      { label: 'J', lat: '26.8098° N', lon: '75.8005° E' },
      { label: 'I', lat: '26.8101° N', lon: '75.8028° E' },
      { label: 'Q', lat: '26.8075° N', lon: '75.8025° E' },
      { label: 'R', lat: '26.8072° N', lon: '75.8001° E' },
    ],
    adjacentParcels: ['109/A', '312/8', '204/1'],
  },
  {
    khasraNo: '312/8',
    recordId: 'LR-1028',
    ownerName: 'Govt. of Rajasthan (Gram Panchayat)',
    area: '14.50 Acres',
    status: 'VERIFIED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Bagru Khurd',
    state: 'Rajasthan',
    lastUpdated: '06 Sep 2026',
    verificationStatus: 'Authorized Public Land Title',
    points: '160,255 380,246 370,395 150,380',
    centroidX: 265,
    centroidY: 320,
    vertices: [
      { label: 'I', lat: '26.8101° N', lon: '75.8028° E' },
      { label: 'S', lat: '26.8106° N', lon: '75.8070° E' },
      { label: 'T', lat: '26.8077° N', lon: '75.8066° E' },
      { label: 'Q', lat: '26.8075° N', lon: '75.8025° E' },
    ],
    adjacentParcels: ['312/1', '109/B', '77/1', '55/2A'],
  },
  {
    khasraNo: '55/2A',
    recordId: 'LR-1030',
    ownerName: 'Ghanshyam Lal Meena',
    area: '2.10 Acres',
    status: 'VERIFIED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Nangal Jaisa',
    state: 'Rajasthan',
    lastUpdated: '05 Sep 2026',
    verificationStatus: 'Authorized & Verified by Tehsildar',
    points: '380,246 520,240 510,380 370,395',
    centroidX: 445,
    centroidY: 312,
    vertices: [
      { label: 'S', lat: '26.8106° N', lon: '75.8070° E' },
      { label: 'N', lat: '26.8110° N', lon: '75.8098° E' },
      { label: 'U', lat: '26.8080° N', lon: '75.8095° E' },
      { label: 'T', lat: '26.8077° N', lon: '75.8066° E' },
    ],
    adjacentParcels: ['312/8', '77/2', '188/4'],
  },
  {
    khasraNo: '188/4',
    recordId: 'LR-1031',
    ownerName: 'Bajrangi Lal Soni',
    area: '0.85 Acres',
    status: 'ANOMALY_DETECTED',
    district: 'Jaipur Rural',
    tehsil: 'Chaksu',
    village: 'Chaksu Khurd',
    state: 'Rajasthan',
    lastUpdated: '01 Sep 2026',
    verificationStatus: 'Overlap Anomaly Detected',
    points: '520,240 680,225 670,370 510,380',
    centroidX: 595,
    centroidY: 300,
    vertices: [
      { label: 'N', lat: '26.8110° N', lon: '75.8098° E' },
      { label: 'V', lat: '26.8115° N', lon: '75.8135° E' },
      { label: 'W', lat: '26.8083° N', lon: '75.8130° E' },
      { label: 'U', lat: '26.8080° N', lon: '75.8095° E' },
    ],
    adjacentParcels: ['55/2A', '77/3', '89/1'],
  },
  {
    khasraNo: '89/1',
    recordId: 'LR-1029',
    ownerName: 'Harish Chandra',
    area: '2.15 Acres',
    status: 'PENDING_VERIFICATION',
    district: 'Patna',
    tehsil: 'Danapur',
    village: 'Danapur Mauza',
    state: 'Bihar',
    lastUpdated: '02 Sep 2026',
    verificationStatus: 'Under Officer Review',
    points: '620,25 780,20 770,195 610,185',
    centroidX: 695,
    centroidY: 105,
    vertices: [
      { label: 'O', lat: '26.8156° N', lon: '75.8125° E' },
      { label: 'X', lat: '26.8160° N', lon: '75.8165° E' },
      { label: 'Y', lat: '26.8123° N', lon: '75.8160° E' },
      { label: 'P', lat: '26.8121° N', lon: '75.8120° E' },
    ],
    adjacentParcels: ['77/3', '188/4', '89/2'],
  },
  {
    khasraNo: '89/2',
    recordId: 'LR-1039',
    ownerName: 'Subhash Chandra Bose',
    area: '1.75 Acres',
    status: 'VERIFIED',
    district: 'Patna',
    tehsil: 'Danapur',
    village: 'Danapur Mauza',
    state: 'Bihar',
    lastUpdated: '07 Sep 2026',
    verificationStatus: 'Authorized & Verified by Tehsildar',
    points: '680,225 800,215 790,360 670,370',
    centroidX: 735,
    centroidY: 290,
    vertices: [
      { label: 'V', lat: '26.8115° N', lon: '75.8135° E' },
      { label: 'Z1', lat: '26.8118° N', lon: '75.8170° E' },
      { label: 'Z2', lat: '26.8085° N', lon: '75.8166° E' },
      { label: 'W', lat: '26.8083° N', lon: '75.8130° E' },
    ],
    adjacentParcels: ['188/4', '89/1'],
  },
];

// Sober, official status badge styling
const STATUS_CONFIG: Record<
  CadastralParcel['status'],
  { label: string; badgeClass: string; fill: string; stroke: string }
> = {
  VERIFIED: {
    label: 'Verified',
    badgeClass: 'gov-badge-success',
    fill: '#ECFDF5',
    stroke: '#059669',
  },
  PENDING_VERIFICATION: {
    label: 'Pending',
    badgeClass: 'gov-badge-warning',
    fill: '#FFFBEB',
    stroke: '#D97706',
  },
  LOW_CONFIDENCE: {
    label: 'Low Confidence',
    badgeClass: 'gov-badge-danger',
    fill: '#FEF2F2',
    stroke: '#DC2626',
  },
  ANOMALY_DETECTED: {
    label: 'Anomaly',
    badgeClass: 'gov-badge-danger',
    fill: '#FEF2F2',
    stroke: '#B91C1C',
  },
  DUPLICATE: {
    label: 'Duplicate',
    badgeClass: 'gov-badge-info',
    fill: '#EFF6FF',
    stroke: '#2563EB',
  },
};

export const GisMapPage: React.FC = () => {
  const { user } = useAuth();
  const isPublicUser = user?.role === 'PUBLIC_USER';

  // State
  const [activeLayer, setActiveLayer] = useState<'cadastral' | 'satellite'>('cadastral');
  const [showRoads, setShowRoads] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showVillageBoundary, setShowVillageBoundary] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals
  const [showRecordModal, setShowRecordModal] = useState<CadastralParcel | null>(null);
  const [showBoundaryModal, setShowBoundaryModal] = useState<CadastralParcel | null>(null);

  // Filter parcels for citizen scope or officer scope
  const authorizedParcels = useMemo(() => {
    if (!isPublicUser) return CADASTRAL_PARCELS;
    return CADASTRAL_PARCELS.filter((p) => {
      const rec = MOCK_LAND_RECORDS.find((r) => r.id === p.recordId);
      return rec?.associatedUserId === user?.id || p.ownerName.toLowerCase().includes(user?.name?.toLowerCase() || 'suresh');
    });
  }, [isPublicUser, user]);

  const [selectedParcel, setSelectedParcel] = useState<CadastralParcel | null>(
    authorizedParcels[0] || CADASTRAL_PARCELS[0]
  );

  const filteredParcels = useMemo(() => {
    return authorizedParcels.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.khasraNo.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.recordId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [authorizedParcels, statusFilter, searchQuery]);

  const handleSelectParcel = (parcel: CadastralParcel) => {
    setSelectedParcel(parcel);
    // Smooth zoom & center towards selected parcel
    setZoom(1.35);
    const offsetX = (425 - parcel.centroidX) * 0.4;
    const offsetY = (220 - parcel.centroidY) * 0.4;
    setPan({ x: offsetX, y: offsetY });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (isPublicUser && authorizedParcels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded border border-slate-300 mt-10 max-w-2xl mx-auto shadow-xs text-center select-none">
        <Lock className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-base font-bold text-slate-800 mb-2">My Land Map Unavailable</h2>
        <p className="text-xs text-slate-600 max-w-md">
          No authorized land parcel boundaries are associated with your citizen account. You can only inspect parcel geometry for verified land titles registered in your name.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 pb-8 select-none ${isFullscreen ? 'fixed inset-0 z-50 bg-[#F8FAFC] p-4 overflow-y-auto' : ''}`}>
      
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-5 h-5 text-[#064E3B]" />
            {isPublicUser ? 'My Land Cadastral Map' : 'GIS Cadastral Map Viewer'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isPublicUser
              ? 'Spatial boundary geometry and parcel survey coordinates for your registered title.'
              : 'Cadastral parcel divisions, boundary audit & geo-referenced land registry plots.'}
          </p>
        </div>

        {/* View Toggle & Layer Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded border border-slate-300 overflow-hidden text-xs">
            <button
              onClick={() => setActiveLayer('cadastral')}
              className={`px-3 py-1.5 font-bold transition flex items-center gap-1.5 ${
                activeLayer === 'cadastral'
                  ? 'bg-[#064E3B] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Cadastral
            </button>
            <button
              onClick={() => setActiveLayer('satellite')}
              className={`px-3 py-1.5 font-bold transition flex items-center gap-1.5 ${
                activeLayer === 'satellite'
                  ? 'bg-[#064E3B] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Satellite
            </button>
          </div>

          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="gov-btn-secondary py-1.5 px-2 text-xs flex items-center gap-1"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Exit Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* ── Main Layout: Sidebar + Map Canvas ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Search + Parcel Directory */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          
          {/* Search Box */}
          <div className="gov-card p-3 rounded border border-slate-300 bg-white space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Khasra No., Village or Owner"
                className="w-full bg-slate-50 text-xs rounded pl-8 pr-3 py-2 border border-slate-300 focus:outline-none focus:border-[#064E3B]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            {!isPublicUser && (
              <div className="flex flex-wrap gap-1">
                {['ALL', 'VERIFIED', 'PENDING_VERIFICATION', 'LOW_CONFIDENCE', 'ANOMALY_DETECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold border transition ${
                      statusFilter === st
                        ? 'bg-[#064E3B] text-white border-[#043D2E]'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'All'
                      : st === 'PENDING_VERIFICATION'
                      ? 'Pending'
                      : st === 'LOW_CONFIDENCE'
                      ? 'Low Conf.'
                      : st === 'ANOMALY_DETECTED'
                      ? 'Anomaly'
                      : 'Verified'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Parcel List */}
          <div className="gov-card rounded border border-slate-300 bg-white overflow-hidden">
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              <span>Cadastral Plots</span>
              <span className="font-mono text-slate-500 font-normal">
                {filteredParcels.length} {filteredParcels.length === 1 ? 'Plot' : 'Plots'}
              </span>
            </div>

            <div className="divide-y divide-slate-200 max-h-[360px] overflow-y-auto">
              {filteredParcels.length > 0 ? (
                filteredParcels.map((p) => {
                  const isSelected = selectedParcel?.khasraNo === p.khasraNo;
                  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.VERIFIED;
                  return (
                    <button
                      key={p.khasraNo}
                      onClick={() => handleSelectParcel(p)}
                      className={`w-full text-left p-3 text-xs transition flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-l-4 border-l-[#064E3B]'
                          : 'hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono">
                          Khasra No. {p.khasraNo}
                        </span>
                        <span className={`gov-badge ${cfg.badgeClass}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Village: {p.village}</span>
                        <span className="font-mono font-medium">{p.area}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No cadastral plots match your search.
                </div>
              )}
            </div>
          </div>

          {/* Map Layer Controls */}
          <div className="gov-card p-3 rounded border border-slate-300 bg-white space-y-2 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>Map Layers</span>
              <Layers className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoads}
                  onChange={(e) => setShowRoads(e.target.checked)}
                  className="rounded text-[#064E3B] focus:ring-0"
                />
                <span className="text-[11px] text-slate-700">Roads & Pathways</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWater}
                  onChange={(e) => setShowWater(e.target.checked)}
                  className="rounded text-[#064E3B] focus:ring-0"
                />
                <span className="text-[11px] text-slate-700">Water Bodies & Canal</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVillageBoundary}
                  onChange={(e) => setShowVillageBoundary(e.target.checked)}
                  className="rounded text-[#064E3B] focus:ring-0"
                />
                <span className="text-[11px] text-slate-700">Village Mauza Boundary</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded text-[#064E3B] focus:ring-0"
                />
                <span className="text-[11px] text-slate-700">Survey Grid Lines</span>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Map Canvas + Selected Parcel Panel */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-3">
          
          <div className="gov-card rounded border border-slate-300 overflow-hidden relative shadow-xs">
            
            {/* Map Canvas Box */}
            <div
              className="relative overflow-hidden cursor-crosshair select-none"
              style={{
                height: '460px',
                background:
                  activeLayer === 'satellite'
                    ? 'linear-gradient(135deg, #132417 0%, #1f3624 40%, #182e1d 100%)'
                    : '#FAF9F6', // Authentic revenue parchment background
              }}
            >
              {/* Cadastral Grid Layer */}
              {showGrid && activeLayer === 'cadastral' && (
                <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(#064E3B20_1px,transparent_1px),linear-gradient(90deg,#064E3B20_1px,transparent_1px)] bg-[size:32px_32px]" />
              )}

              {/* Satellite Texture Grid */}
              {showGrid && activeLayer === 'satellite' && (
                <div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(#ffffff20_1px,transparent_1px),linear-gradient(90deg,#ffffff20_1px,transparent_1px)] bg-[size:40px_40px]" />
              )}

              {/* SVG Cadastral Map */}
              <svg
                className="w-full h-full"
                viewBox="0 0 850 440"
                preserveAspectRatio="xMidYMid meet"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Village Outer Boundary */}
                {showVillageBoundary && (
                  <rect
                    x="20"
                    y="15"
                    width="810"
                    height="410"
                    fill="none"
                    stroke={activeLayer === 'satellite' ? '#F59E0B' : '#064E3B'}
                    strokeWidth="1.5"
                    strokeDasharray="8 4"
                    opacity="0.6"
                  />
                )}

                {/* Village Road / Pathway Layer */}
                {showRoads && (
                  <g opacity="0.8">
                    <path
                      d="M 10,248 Q 280,240 500,235 Q 670,230 840,225"
                      fill="none"
                      stroke={activeLayer === 'satellite' ? '#E2E8F0' : '#94A3B8'}
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10,248 Q 280,240 500,235 Q 670,230 840,225"
                      fill="none"
                      stroke={activeLayer === 'satellite' ? '#1E293B' : '#FFFFFF'}
                      strokeWidth="1"
                      strokeDasharray="6 6"
                    />
                    <text
                      x="180"
                      y="238"
                      fill={activeLayer === 'satellite' ? '#F8FAFC' : '#475569'}
                      fontSize="9"
                      fontWeight="bold"
                      letterSpacing="0.05em"
                    >
                      VILLAGE REVENUE ROAD (12M)
                    </text>
                  </g>
                )}

                {/* Water Canal & Reservoir Layer */}
                {showWater && (
                  <g>
                    {/* Canal line */}
                    <path
                      d="M 400,10 Q 405,140 380,250 Q 360,340 350,430"
                      fill="none"
                      stroke="#93C5FD"
                      strokeWidth="4"
                      opacity="0.85"
                    />
                    {/* Village Talab Reservoir */}
                    <ellipse
                      cx="60"
                      cy="380"
                      rx="35"
                      ry="25"
                      fill="#BFDBFE"
                      stroke="#60A5FA"
                      strokeWidth="1"
                      opacity="0.8"
                    />
                    <text x="35" y="383" fill="#1D4ED8" fontSize="8" fontWeight="bold">
                      Talab
                    </text>
                  </g>
                )}

                {/* Cadastral Parcels Rendering */}
                {authorizedParcels.map((parcel) => {
                  const isSelected = selectedParcel?.khasraNo === parcel.khasraNo;
                  const isFiltered = !filteredParcels.some((p) => p.khasraNo === parcel.khasraNo);
                  const cfg = STATUS_CONFIG[parcel.status] || STATUS_CONFIG.VERIFIED;

                  // Sober cadastral stroke and fill
                  const parcelFill =
                    activeLayer === 'satellite'
                      ? isSelected
                        ? 'rgba(245, 158, 11, 0.35)'
                        : 'rgba(6, 78, 59, 0.25)'
                      : isSelected
                      ? '#FEF3C7' // Soft warm gold on selection
                      : cfg.fill;

                  const parcelStroke =
                    isSelected
                      ? '#D97706' // Crisp amber border for selected
                      : activeLayer === 'satellite'
                      ? '#34D399'
                      : '#475569'; // Muted dark slate cadastral survey line

                  return (
                    <g
                      key={parcel.khasraNo}
                      onClick={() => handleSelectParcel(parcel)}
                      className="cursor-pointer group"
                    >
                      {/* Polygon plot */}
                      <polygon
                        points={parcel.points}
                        fill={isFiltered ? '#F1F5F9' : parcelFill}
                        stroke={parcelStroke}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        opacity={isFiltered ? 0.35 : 1}
                        style={{ transition: 'all 0.15s ease-out' }}
                      />

                      {/* Parcel Label (Khasra Number + Area) */}
                      {!isFiltered && (
                        <g pointerEvents="none">
                          <text
                            x={parcel.centroidX}
                            y={parcel.centroidY - 4}
                            textAnchor="middle"
                            fill={activeLayer === 'satellite' ? '#FFFFFF' : '#0F172A'}
                            fontSize={isSelected ? '11' : '10'}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {parcel.khasraNo}
                          </text>

                          <text
                            x={parcel.centroidX}
                            y={parcel.centroidY + 8}
                            textAnchor="middle"
                            fill={activeLayer === 'satellite' ? '#E2E8F0' : '#475569'}
                            fontSize="8.5"
                            fontFamily="sans-serif"
                          >
                            {parcel.area}
                          </text>
                        </g>
                      )}

                      {/* Highlighted Boundary Corner Vertices on Selection */}
                      {isSelected && (
                        <g pointerEvents="none">
                          <circle
                            cx={parcel.centroidX}
                            cy={parcel.centroidY - 18}
                            r="4"
                            fill="#D97706"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Top Left: Official Survey Metadata Overlay */}
              <div className="absolute top-3 left-3 bg-white/95 border border-slate-300 text-slate-800 p-2.5 rounded shadow-xs text-xs space-y-0.5 backdrop-blur-xs max-w-xs">
                <div className="font-bold text-[#064E3B] text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  Rampur Revenue Sheet #04
                </div>
                <div className="text-[10px] text-slate-600">
                  Tehsil: Chaksu · District: Jaipur Rural
                </div>
                <div className="font-mono text-[9px] text-slate-500 pt-0.5 border-t border-slate-200">
                  CRS: EPSG:4326 · Scale: 1:1,000 Cadastral
                </div>
              </div>

              {/* Top Right: North Arrow & Scale Indicator */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                <div className="bg-white/95 border border-slate-300 p-1.5 rounded shadow-xs flex items-center gap-1 text-[10px] font-bold text-slate-700">
                  <Navigation className="w-3.5 h-3.5 text-[#064E3B] rotate-45" />
                  <span>N</span>
                </div>

                {/* Scale Bar */}
                <div className="bg-white/90 border border-slate-300 px-2 py-1 rounded text-[9px] font-mono text-slate-600 shadow-xs flex flex-col items-center">
                  <div className="w-16 h-1 bg-slate-800 flex justify-between">
                    <span className="w-0.5 h-2 bg-slate-800 -mt-0.5" />
                    <span className="w-0.5 h-2 bg-slate-800 -mt-0.5" />
                  </div>
                  <span className="pt-0.5">100m</span>
                </div>
              </div>

              {/* Bottom Right: Minimal Consistent Map Controls */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1 shadow-xs">
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
                  className="p-2 bg-white text-slate-800 rounded border border-slate-300 hover:bg-slate-50 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetView}
                  className="p-2 bg-white text-slate-800 rounded border border-slate-300 hover:bg-slate-50 transition"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
                  className="p-2 bg-white text-slate-800 rounded border border-slate-300 hover:bg-slate-50 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-white text-slate-800 rounded border border-slate-300 hover:bg-slate-50 transition"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* ── Selected Parcel Information Panel ───────────────────────────── */}
            {selectedParcel && (
              <div className="p-4 bg-white border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#064E3B] font-mono">
                      Khasra No. {selectedParcel.khasraNo}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-semibold">
                      Village: {selectedParcel.village}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700">
                      District: {selectedParcel.district}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-800 font-bold">
                      Area: {selectedParcel.area}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                    <span>
                      <strong>Status:</strong>{' '}
                      <span className="font-semibold text-slate-800">
                        {STATUS_CONFIG[selectedParcel.status]?.label}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Last Updated:</strong> {selectedParcel.lastUpdated}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Verification:</strong> {selectedParcel.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowRecordModal(selectedParcel)}
                    className="gov-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#064E3B]" />
                    <span>View Land Record</span>
                  </button>

                  <button
                    onClick={() => setShowBoundaryModal(selectedParcel)}
                    className="gov-btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Inspect Boundary</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL 1: VIEW LAND RECORD (OFFICIAL TITLE SHEET)
         ══════════════════════════════════════════════════════════════ */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="gov-badge gov-badge-success">
                  {STATUS_CONFIG[showRecordModal.status]?.label}
                </span>
                <span className="font-mono text-xs font-bold text-[#064E3B]">
                  #{showRecordModal.recordId}
                </span>
              </div>
              <button
                onClick={() => setShowRecordModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#064E3B]">
                Jamabandi Record of Rights — Khasra #{showRecordModal.khasraNo}
              </h3>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Khasra Number
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    #{showRecordModal.khasraNo}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Parcel Area
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {showRecordModal.area}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Owner Name
                  </span>
                  <span className="font-bold text-slate-900">
                    {showRecordModal.ownerName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Location
                  </span>
                  <span className="text-slate-800">
                    {showRecordModal.village}, {showRecordModal.tehsil}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Jurisdiction
                  </span>
                  <span className="text-slate-800">
                    District {showRecordModal.district}, {showRecordModal.state}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{showRecordModal.verificationStatus}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRecordModal(null)}
                className="gov-btn-primary py-1.5 px-4 text-xs font-bold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 2: INSPECT BOUNDARY (SURVEY VERTICES & ADJACENCY)
         ══════════════════════════════════════════════════════════════ */}
      {showBoundaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#064E3B]" />
                <h3 className="font-bold text-sm text-[#064E3B]">
                  Cadastral Boundary Survey — Khasra #{showBoundaryModal.khasraNo}
                </h3>
              </div>
              <button
                onClick={() => setShowBoundaryModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Geo-referenced polygon corner nodes and contiguous cadastral boundaries.
              </p>

              {/* Vertex Coordinates Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Node</th>
                      <th>Latitude (GPS)</th>
                      <th>Longitude (GPS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showBoundaryModal.vertices.map((v) => (
                      <tr key={v.label}>
                        <td className="font-mono font-bold text-[#064E3B]">
                          Point {v.label}
                        </td>
                        <td className="font-mono">{v.lat}</td>
                        <td className="font-mono">{v.lon}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Adjacent Parcels */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Adjacent Survey Parcels (Contiguous Bounds)
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {showBoundaryModal.adjacentParcels.map((adj) => (
                    <span
                      key={adj}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-xs font-semibold text-slate-800"
                    >
                      Khasra #{adj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowBoundaryModal(null)}
                className="gov-btn-primary py-1.5 px-4 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
