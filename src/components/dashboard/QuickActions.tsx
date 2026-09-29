import React from 'react';
import type { NavigationTab } from '../common/Sidebar';
import { Upload, CheckSquare, Search, Map } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';

interface QuickActionsProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const { permissions } = useAuth();
  const { t } = useTranslation();

  const actions = [
    {
      title: t('dashboard.uploadNewDoc'),
      description: t('upload.subtitle'),
      icon: Upload,
      tab: 'upload' as NavigationTab,
      allowed: permissions.canUploadDocuments
    },
    {
      title: t('dashboard.verifyPending'),
      description: t('verification.subtitle'),
      icon: CheckSquare,
      tab: 'verification' as NavigationTab,
      allowed: permissions.canVerifyRecords || permissions.canAccessAllRecords
    },
    {
      title: t('dashboard.searchRegistry'),
      description: t('search.subtitle'),
      icon: Search,
      tab: 'records' as NavigationTab,
      allowed: true
    },
    {
      title: t('dashboard.viewGisMaps'),
      description: t('gis.subtitle'),
      icon: Map,
      tab: 'gis' as NavigationTab,
      allowed: true
    }
  ];

  return (
    <div className="gov-card p-4 rounded border border-slate-300 mb-6">
      <div className="mb-3 pb-2 border-b border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">{t('dashboard.quickActions')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          const isAllowed = act.allowed;

          return (
            <button
              key={act.tab}
              disabled={!isAllowed}
              onClick={() => isAllowed && onNavigate(act.tab)}
              className={`p-3 rounded border text-left transition-colors flex flex-col justify-between ${
                isAllowed
                  ? 'bg-white border-slate-300 hover:border-blue-800 hover:bg-slate-50'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded ${isAllowed ? 'bg-[#1B365D] text-white' : 'bg-slate-300 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900">{act.title}</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{act.description}</p>
              </div>

              {!isAllowed && (
                <span className="mt-2 text-[9px] uppercase font-bold text-slate-400">Restricted</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

