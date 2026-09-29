import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, PermissionCheck } from '../types/auth';
import { MOCK_USERS } from '../mockData/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (emailOrUsername: string, role?: UserRole, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  permissions: PermissionCheck;
  switchRole: (role: UserRole) => void;
  clearError: () => void;
}

const DEFAULT_PERMISSIONS: PermissionCheck = {
  canUploadDocuments: false,
  canEditRecords: false,
  canVerifyRecords: false,
  canManageUsers: false,
  canViewAuditLogs: false,
  canViewAnalytics: false,
  canAccessAllRecords: false,
  canSearchPublicRecords: false,
  canViewOfficerDirectory: false,
};

export const getRolePermissions = (role?: UserRole | null): PermissionCheck => {
  if (!role) return DEFAULT_PERMISSIONS;

  switch (role) {
    case 'ADMIN':
      return {
        canUploadDocuments: true,
        canEditRecords: true,
        canVerifyRecords: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canViewAnalytics: true,
        canAccessAllRecords: true,
        canSearchPublicRecords: true,
        canViewOfficerDirectory: true,
      };

    case 'LAND_RECORD_OFFICER':
      return {
        canUploadDocuments: true,
        canEditRecords: true,
        canVerifyRecords: true,
        canManageUsers: false,
        canViewAuditLogs: true,
        canViewAnalytics: true,
        canAccessAllRecords: true,
        canSearchPublicRecords: true,
        canViewOfficerDirectory: true,
      };

    case 'PUBLIC_USER':
      return {
        canUploadDocuments: false,
        canEditRecords: false,
        canVerifyRecords: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canViewAnalytics: false,
        canAccessAllRecords: false, // Public users can only see their verified records
        canSearchPublicRecords: true,
        canViewOfficerDirectory: false, // Must not see officer tables
      };

    default:
      return DEFAULT_PERMISSIONS;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ilrdvs_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from local/session storage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    emailOrUsername: string, 
    roleHint?: UserRole, 
    rememberMe: boolean = true
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulate small backend network latency for realistic feel
    await new Promise((res) => setTimeout(res, 600));

    // Match demo accounts or role selection
    let matchedUser: User | undefined;

    if (roleHint && MOCK_USERS[roleHint]) {
      matchedUser = MOCK_USERS[roleHint];
    } else {
      const input = emailOrUsername.toLowerCase().trim();
      matchedUser = Object.values(MOCK_USERS).find(
        (u) => u.email.toLowerCase() === input || u.username.toLowerCase() === input
      );
    }

    if (!matchedUser) {
      // Default to Public User if unknown input, or display clean message
      matchedUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@gov.in`,
        username: emailOrUsername,
        role: roleHint || 'PUBLIC_USER',
        department: roleHint === 'ADMIN' ? 'Central Administration' : 'Public Access',
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    } else {
      // Update last login
      matchedUser = {
        ...matchedUser,
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    }

    setUser(matchedUser);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));

    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    if (MOCK_USERS[newRole]) {
      const newUser = {
        ...MOCK_USERS[newRole],
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    }
  };

  const clearError = () => setError(null);

  const permissions = getRolePermissions(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        permissions,
        switchRole,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
