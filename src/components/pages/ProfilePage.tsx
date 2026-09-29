import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CitizenProfilePage } from './CitizenProfilePage';
import { OfficerProfilePage } from './OfficerProfilePage';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'PUBLIC_USER') {
    return <CitizenProfilePage />;
  }

  return <OfficerProfilePage />;
};
