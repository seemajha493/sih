import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Lock, Plus, Edit3, ShieldCheck, Search, Filter } from 'lucide-react';

const MOCK_SYSTEM_USERS = [
  { id: 'USR-001', name: 'Rajesh V. Sharma',     username: 'admin',     email: 'admin@dolr.gov.in',    role: 'ADMIN',                 dept: 'DoLR HQ, New Delhi',         district: 'Central HQ',       status: 'ACTIVE',   lastLogin: '2026-09-08 15:30' },
  { id: 'USR-002', name: 'Priya S. Verma',        username: 'lrofficer', email: 'officer@dolr.gov.in',  role: 'LAND_RECORD_OFFICER',   dept: 'Tehsil Land Revenue Office', district: 'Jaipur Rural',     status: 'ACTIVE',   lastLogin: '2026-09-08 14:15' },
  { id: 'USR-003', name: 'Dinesh Kumar Yadav',    username: 'dyadav',    email: 'dyadav@dolr.gov.in',   role: 'LAND_RECORD_OFFICER',   dept: 'Tehsil Land Revenue Office', district: 'Patna',            status: 'INACTIVE', lastLogin: '2026-09-01 09:00' },
  { id: 'USR-004', name: 'Suresh Kumar',          username: 'citizen',   email: 'citizen@gmail.com',    role: 'PUBLIC_USER',           dept: 'Public Citizen Portal',      district: 'Patna',            status: 'ACTIVE',   lastLogin: '2026-09-06 11:10' },
  { id: 'USR-005', name: 'Shyamli Mukherjee',     username: 'smukh',     email: 'smukh@dolr.gov.in',    role: 'LAND_RECORD_OFFICER',   dept: 'Tehsil Land Revenue Office', district: 'South 24 Parganas',status: 'ACTIVE',   lastLogin: '2026-09-07 14:30' },
  { id: 'USR-006', name: 'Pankaj Tiwari',         username: 'ptiwari',   email: 'ptiwari@dolr.gov.in',  role: 'ADMIN',                 dept: 'DoLR State HQ, Lucknow',     district: 'Lucknow',          status: 'ACTIVE',   lastLogin: '2026-09-08 08:00' },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'System Administrator',
  LAND_RECORD_OFFICER: 'Land Record Officer',
  PUBLIC_USER: 'Citizen / Public User',
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'text-purple-800 bg-purple-50 border-purple-300',
  LAND_RECORD_OFFICER: 'text-blue-800 bg-blue-50 border-blue-300',
  PUBLIC_USER: 'text-slate-600 bg-slate-100 border-slate-300',
};

export const UserManagementPage: React.FC = () => {
  const { permissions } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (!permissions.canManageUsers) {
    return (
      <div className="gov-card p-8 text-center max-w-md mx-auto my-12 rounded border border-slate-300">
        <Lock className="w-10 h-10 text-rose-700 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-1">Permission required: Administrator designation.</p>
      </div>
    );
  }

  const filtered = MOCK_SYSTEM_USERS.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.district.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-8 select-none">
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1B365D]" /> User Management
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage officer accounts, roles, and departmental access permissions
          </p>
        </div>
        <button className="gov-btn-primary py-2 px-3 text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add New Officer
        </button>
      </div>

      {/* Filters */}
      <div className="gov-card p-3 rounded border border-slate-300 bg-white flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name, username, district…"
            className="w-full bg-slate-50 text-xs rounded pl-7 pr-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#1B365D]" />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <Filter className="w-3 h-3 text-slate-500" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none">
            <option value="ALL">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(st => (
            <button key={st} onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                statusFilter === st ? 'bg-[#1B365D] text-white border-[#002B49]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}>{st === 'ALL' ? 'All Status' : st}</button>
          ))}
          <span className="text-slate-500 font-mono ml-1">{filtered.length} users</span>
        </div>
      </div>

      {/* Table */}
      <div className="gov-card rounded border border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Username / Email</th>
                <th>Role</th>
                <th>Department / District</th>
                <th>Status</th>
                <th>Last Login</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="font-mono font-bold text-[#1B365D]">{u.id}</td>
                  <td className="font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1B365D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {u.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                    </div>
                    {u.name}
                  </td>
                  <td>
                    <div className="font-mono text-[11px] text-slate-800">{u.username}</div>
                    <div className="text-[10px] text-slate-500">{u.email}</div>
                  </td>
                  <td>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ROLE_BADGE[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td>
                    <div className="text-[11px]">{u.dept}</div>
                    <div className="text-[10px] text-slate-500">{u.district}</div>
                  </td>
                  <td>
                    <span className={`gov-badge ${u.status === 'ACTIVE' ? 'gov-badge-success' : 'gov-badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="font-mono text-[10px] text-slate-500">{u.lastLogin}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="gov-btn-secondary p-1 text-[11px]" title="Edit User">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="gov-btn-secondary p-1 text-[11px]" title="Manage Role">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
