import React from 'react';
import type { PublicPageTab } from '../common/PublicHeader';
import { PublicHeader } from '../common/PublicHeader';
import { PublicFooter } from '../common/PublicFooter';
import { PublicLandRecordSearch } from './PublicLandRecordSearch';
import type { UserRole } from '../../types/auth';

interface PublicLandRecordsPageProps {
  onNavigatePage: (page: PublicPageTab) => void;
  isAuthenticated?: boolean;
  onLoginClick: (role?: UserRole) => void;
  onGoToDashboard?: () => void;
}

export const PublicLandRecordsPage: React.FC<PublicLandRecordsPageProps> = ({
  onNavigatePage,
  isAuthenticated,
  onLoginClick,
  onGoToDashboard,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-[#1F2937]">
      <PublicHeader
        activePage="land-records"
        onNavigatePage={onNavigatePage}
        isAuthenticated={isAuthenticated}
        onLoginClick={onLoginClick}
        onGoToDashboard={onGoToDashboard}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 mt-12">
        <PublicLandRecordSearch isAuthenticated={isAuthenticated} onLoginClick={onLoginClick} />
      </main>

      <PublicFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
