import React, { useState } from 'react';
import { Search, MapPin, FileText, Lock, User as UserIcon, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { MOCK_LAND_RECORDS } from '../../mockData/mockData';
import type { LandRecord } from '../../types/landRecord';
import type { UserRole } from '../../types/auth';

interface PublicLandRecordSearchProps {
  isAuthenticated?: boolean;
  onLoginClick: (role?: UserRole) => void;
}

export const PublicLandRecordSearch: React.FC<PublicLandRecordSearchProps> = ({
  isAuthenticated,
  onLoginClick,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [village, setVillage] = useState('');
  const [khasra, setKhasra] = useState('');
  const [khata, setKhata] = useState('');
  
  const [hasSearched, setHasSearched] = useState(false);
  const [foundRecord, setFoundRecord] = useState<LandRecord | null>(null);
  const [searchError, setSearchError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setSearchError('');
    setFoundRecord(null);
    
    if (!khasra.trim() || !district.trim() || !village.trim()) {
      setSearchError('Please fill in at least District, Village, and Khasra/Plot Number.');
      return;
    }
    
    // Simulate finding the record
    const match = MOCK_LAND_RECORDS.find(r => 
      r.district.toLowerCase() === district.toLowerCase().trim() &&
      r.villageMauza.toLowerCase() === village.toLowerCase().trim() &&
      r.khasraNo === khasra.trim()
    );
    
    if (!match) {
      setSearchError(t('search.noRecords'));
      return;
    }
    
    // Connect to user's identity based on RBAC rule
    if (!isAuthenticated || !user) {
      setSearchError('LOGIN_REQUIRED');
      return;
    }
    
    if (match.associatedUserId !== user.id) {
      setSearchError('UNAUTHORIZED');
      return;
    }
    
    setFoundRecord(match);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      
      {/* Search Header */}
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-3xl font-extrabold text-[#1B365D] tracking-tight">{t('search.title')}</h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          {t('search.subtitle')}
        </p>
      </div>
      
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B365D] to-[#2E5984] p-4 text-white flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-lg">{t('search.title')}</h2>
        </div>
        
        <form onSubmit={handleSearch} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t('fields.district')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('upload.districtPlaceholder')}
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D] outline-none transition"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t('fields.tehsil')}
              </label>
              <input
                type="text"
                placeholder={t('upload.tehsilPlaceholder')}
                value={block}
                onChange={e => setBlock(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D] outline-none transition"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t('fields.villageMauza')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('upload.villagePlaceholder')}
                value={village}
                onChange={e => setVillage(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D] outline-none transition"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> {t('fields.khasraNo')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 109/B"
                value={khasra}
                onChange={e => setKhasra(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D] outline-none transition"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> {t('fields.khataNo')} ({t('common.optional')})
              </label>
              <input
                type="text"
                placeholder="e.g. 87"
                value={khata}
                onChange={e => setKhata(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D] outline-none transition"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="bg-[#1B365D] hover:bg-[#152B4A] text-white font-bold py-3 px-10 rounded shadow-md transition transform hover:-translate-y-0.5"
            >
              {t('home.searchBtn')}
            </button>
          </div>
        </form>
      </div>
      
      {/* Results Section */}
      {hasSearched && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          
          {searchError === 'LOGIN_REQUIRED' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center shadow-sm">
              <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Authentication Required</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                A matching record was found, but you must be logged in to verify authorization and view the details.
              </p>
              <button 
                onClick={() => onLoginClick('PUBLIC_USER')}
                className="inline-flex items-center gap-2 bg-[#1B365D] text-white px-6 py-2.5 rounded font-bold hover:bg-[#152B4A] transition"
              >
                <LogIn className="w-4 h-4" /> Log in as Citizen
              </button>
            </div>
          )}
          
          {searchError === 'UNAUTHORIZED' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-sm">
              <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Access Denied</h3>
              <p className="text-slate-600 mb-4 max-w-md mx-auto">
                You are not authorized to view this record. This record belongs to another citizen. 
                For privacy reasons, you may only view records associated with your identity.
              </p>
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded text-xs text-slate-500 font-mono shadow-inner">
                <UserIcon className="w-3.5 h-3.5" /> Logged in as {user?.name}
              </div>
            </div>
          )}
          
          {searchError && searchError !== 'LOGIN_REQUIRED' && searchError !== 'UNAUTHORIZED' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{searchError}</p>
            </div>
          )}
          
          {foundRecord && (
            <div className="bg-white rounded-xl shadow-lg border border-emerald-200 overflow-hidden">
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-emerald-800">Authorized Record Found</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Verified
                </span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Owner Name</div>
                    <div className="font-semibold text-slate-900 text-lg">{foundRecord.ownerName}</div>
                    {foundRecord.coOwnerName && <div className="text-sm text-slate-500">+ {foundRecord.coOwnerName}</div>}
                  </div>
                  
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Khasra / Plot Number</div>
                    <div className="font-mono font-bold text-slate-800 text-lg">{foundRecord.khasraNo}</div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Record ID</div>
                    <div className="font-mono text-slate-500">{foundRecord.id}</div>
                  </div>
                  
                  <div className="lg:col-span-3 border-t border-slate-100 pt-4 mt-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">District</div>
                        <div className="font-medium text-slate-700">{foundRecord.district}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Tehsil</div>
                        <div className="font-medium text-slate-700">{foundRecord.tehsil}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Village</div>
                        <div className="font-medium text-slate-700">{foundRecord.villageMauza}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Area</div>
                        <div className="font-medium text-slate-700">{foundRecord.areaAcres} {foundRecord.areaUnit || 'Acres'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3">
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded transition">
                    Request Mutation
                  </button>
                  <button className="bg-[#1B365D] hover:bg-[#152B4A] text-white font-semibold py-2 px-4 rounded shadow transition">
                    Download Certified Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
