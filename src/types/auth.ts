export type UserRole = 
  | 'ADMIN'
  | 'LAND_RECORD_OFFICER'
  | 'VERIFICATION_OFFICER'
  | 'PUBLIC_USER';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  lastLogin?: string;
  stateOffice?: string;
  district?: string;
}

export interface PermissionCheck {
  canUploadDocuments: boolean;
  canEditRecords: boolean;
  canVerifyRecords: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canViewAnalytics: boolean;
  canAccessAllRecords: boolean;
  canSearchPublicRecords: boolean;
  canViewOfficerDirectory: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
