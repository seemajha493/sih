import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Bell, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CitizenProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const ToggleSwitch: React.FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => (
    <button
      onClick={() => onChange(!on)}
      className={`w-10 h-5 rounded-full transition-colors relative ${on ? 'bg-[#1B365D]' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-full h-full p-4 text-slate-300" />
          )}
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
          <p className="text-slate-500 font-mono text-sm">{user?.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 pt-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Verified Citizen Account
            </span>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              UID: {user?.id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Personal Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-[#1B365D]" /> Personal Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="font-semibold text-slate-800">{user?.name}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> +91 98765 43210
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                <div className="font-semibold text-slate-800 flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" /> 
                  <span>{user?.district || 'Jaipur Rural'},<br/>{user?.stateOffice || 'Rajasthan'}, India</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button className="text-sm text-[#1B365D] font-bold hover:underline">Edit Personal Details</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Key className="w-4 h-4 text-[#1B365D]" /> Account Security
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Password</div>
                <div className="text-xs text-slate-500 mt-0.5">Last changed 45 days ago</div>
              </div>
              <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded text-xs font-bold hover:bg-slate-50 transition shadow-sm w-full sm:w-auto">
                Change Password
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Two-Factor Authentication</div>
                <div className="text-xs text-slate-500 mt-0.5">Secure your account with OTP</div>
              </div>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-emerald-700 transition shadow-sm w-full sm:w-auto">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          
          <div className="bg-[#1B365D] text-white p-6 rounded-xl shadow-md">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-white/20 pb-3">
              <Shield className="w-4 h-4" /> Account Status
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-blue-200 uppercase font-bold">Authorized Land Records</div>
                <div className="text-2xl font-bold mt-1">1</div>
                <button className="text-[11px] text-amber-300 hover:text-amber-200 font-bold mt-1 inline-flex items-center gap-1">
                  View My Records →
                </button>
              </div>
              <div className="pt-3 border-t border-white/10">
                <div className="text-[10px] text-blue-200 uppercase font-bold">Pending Requests</div>
                <div className="text-xl font-bold mt-1">0</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-4 h-4 text-[#1B365D]" /> Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">Email Alerts</span>
                <ToggleSwitch on={emailAlerts} onChange={setEmailAlerts} />
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">SMS Alerts</span>
                <ToggleSwitch on={smsAlerts} onChange={setSmsAlerts} />
              </div>
              <div className="text-[10px] text-slate-500 pt-2 leading-relaxed">
                Receive notifications regarding your land record mutation requests and document access.
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
