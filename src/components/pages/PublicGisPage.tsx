import React from 'react';
import type { PublicPageTab } from '../common/PublicHeader';
import { PublicHeader } from '../common/PublicHeader';
import { PublicFooter } from '../common/PublicFooter';
import { GisMapPage } from './GisMapPage';
import type { UserRole } from '../../types/auth';

interface PublicGisMapPageProps {
  onNavigatePage: (page: PublicPageTab) => void;
  isAuthenticated?: boolean;
  onLoginClick: (role?: UserRole) => void;
  onGoToDashboard?: () => void;
}

export const PublicGisMapPage: React.FC<PublicGisMapPageProps> = ({
  onNavigatePage,
  isAuthenticated,
  onLoginClick,
  onGoToDashboard,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-[#1F2937]">
      <PublicHeader
        activePage="gis"
        onNavigatePage={onNavigatePage}
        isAuthenticated={isAuthenticated}
        onLoginClick={onLoginClick}
        onGoToDashboard={onGoToDashboard}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <GisMapPage />
      </main>

      <PublicFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
