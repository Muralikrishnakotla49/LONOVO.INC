/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  Clock, 
  IndianRupee, 
  Users, 
  Settings, 
  ShieldAlert,
  ArrowRightLeft,
  User,
  LogOut
} from 'lucide-react';

interface NavigationSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  userRole: string;
  onLogout?: () => void;
}

export default function NavigationSidebar({
  currentTab,
  onTabChange,
  userName,
  userRole,
  onLogout
}: NavigationSidebarProps) {
  
  const isEmployee = userRole === 'EMPLOYEE';

  const navItems = isEmployee
    ? [{ id: 'portal', name: 'Employee Portal', icon: User }]
    : [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', name: 'Attendance', icon: Clock },
        { id: 'payroll', name: 'Payroll', icon: IndianRupee },
        { id: 'employees', name: 'Employees', icon: Users },
        { id: 'portal', name: 'Employee Portal', icon: User },
        { id: 'settings', name: 'Settings', icon: Settings },
      ];

  return (
    <aside 
      id="main-sidebar"
      className="fixed top-0 left-0 h-screen w-[260px] bg-white border-r border-slate-200 flex flex-col justify-between py-6 z-30"
    >
      <div>
        {/* Brand Header */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white" id="brand-logo">
            <svg 
              className="w-4.5 h-4.5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-900 font-display" id="brand-title">LONOVO.INC</h1>
            <p className="text-[10px] font-medium text-slate-400 tracking-wider uppercase font-display" id="brand-subtitle">Enhanced Digital Work</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center py-2.5 px-4 rounded text-sm transition-all duration-150 relative group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {/* Active left indicator tag */}
                {isActive && (
                  <span 
                    id={`active-indicator-${item.id}`}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-indigo-600 rounded-r"
                  />
                )}
                
                <IconComponent className={`w-[18px] h-[18px] mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="font-display">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Admin Action Links */}
      <div className="px-3 space-y-4">
        <div className="h-[1px] bg-slate-200 mx-3" />
        
        {/* Quick Admin Navigation Settings link */}
        {!isEmployee && (
          <button
            id="btn-admin-settings"
            onClick={() => onTabChange('settings')}
            className="w-full flex items-center px-4 py-2 text-xs font-display font-medium text-slate-500 hover:text-slate-900 rounded hover:bg-slate-50 transition-all gap-3"
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
            <span>Admin Settings</span>
          </button>
        )}

        {/* Log Out button for all users */}
        {onLogout && (
          <button
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-xs font-display font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-all gap-3 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Exit Session</span>
          </button>
        )}

        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg" id="user-profile-widget">
          <div className="relative">
            <img
              src={isEmployee ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"}
              alt={userName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-800 truncate leading-tight font-display">{userName}</h4>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate font-display">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
