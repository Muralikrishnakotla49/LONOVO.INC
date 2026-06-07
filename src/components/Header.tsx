/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, CheckCircle2, Calendar, Cloud, CloudOff, LogIn, LogOut, AlertCircle, IndianRupee, X, Menu, Sun, Moon } from 'lucide-react';
import { PayrollBatch, AttendanceRecord } from '../types';

interface HeaderProps {
  currentTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  periods: string[];
  currentUser: any; // Firebase user
  onLogin: () => void;
  onLogout: () => void;
  isSyncing?: boolean;
  activeBatch?: PayrollBatch;
  attendanceLogs?: AttendanceRecord[];
  onTabChange?: (tab: string) => void;
  onMenuClick?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

interface AppNotification {
  id: string;
  type: 'payroll' | 'attendance';
  title: string;
  text: string;
  time: string;
  linkToTab: 'payroll' | 'attendance';
}

export default function Header({
  currentTab,
  searchQuery,
  onSearchChange,
  selectedPeriod,
  onPeriodChange,
  periods,
  currentUser,
  onLogin,
  onLogout,
  isSyncing = false,
  activeBatch,
  attendanceLogs = [],
  onTabChange,
  onMenuClick,
  theme,
  onToggleTheme
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);

  // Construct dynamic alerts based on real-time state
  const dynamicNotifications: AppNotification[] = [];

  // Active Batch alert - when it reaches "Finalize Payout" status and is not completed/authorized yet
  if (activeBatch && activeBatch.status === 'Finalize Payout' && !activeBatch.isCompleted) {
    dynamicNotifications.push({
      id: `payroll-${activeBatch.id}-${activeBatch.status}`,
      type: 'payroll',
      title: 'Deductions Ready for Payout',
      text: `Payroll batch "${activeBatch.name}" (${activeBatch.period}) has reached the Finalize Payout stage and is ready for compliance authorization.`,
      time: 'Action Required',
      linkToTab: 'payroll'
    });
  }

  // Attendance reviews for abnormalities
  if (attendanceLogs && attendanceLogs.length > 0) {
    const anomalousLogs = attendanceLogs.filter(
      log => log.status === 'Late' || log.status === 'Absent' || log.status === 'Half Day'
    );

    anomalousLogs.forEach(log => {
      dynamicNotifications.push({
        id: `att-${log.id}-${log.status}`,
        type: 'attendance',
        title: `Verify ${log.employeeName} attendance`,
        text: `${log.employeeName} logged timesheet anomaly ("${log.status}") on ${log.date}. Review the exact morning arrival clock-in time (${log.clockIn}).`,
        time: log.date,
        linkToTab: 'attendance'
      });
    });
  }

  // Filter to active, non-dismissed alerts
  const activeAlerts = dynamicNotifications.filter(notif => !dismissedNotifIds.includes(notif.id));

  const handleDismissNotif = (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedNotifIds(prev => [...prev, notifId]);
  };

  const handleClearAll = () => {
    const allIds = dynamicNotifications.map(n => n.id);
    setDismissedNotifIds(allIds);
  };

  const handleNotifClick = (tab: 'payroll' | 'attendance') => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setShowNotifications(false);
  };

  return (
    <header 
      id="main-header"
      className="fixed top-0 right-0 lg:left-[260px] left-0 h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-40"
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <button
          id="btn-hamburger-mobile"
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 transition mr-1 shrink-0"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
        
        <div className="lg:hidden flex items-center gap-1 mr-2 shrink-0">
          <span className="text-xs font-black tracking-wide font-display text-indigo-600 block">S.H.I.E.L.D</span>
          <span className="text-[8px] bg-indigo-50 text-indigo-800 px-1.5 py-0.2 rounded font-bold">V2.4</span>
        </div>

        {/* Search Input Widget */}
        <div className="relative hidden sm:block w-[180px] md:w-[260px] lg:w-[380px]" id="header-search-container">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="header-search-input"
            type="text"
            placeholder="Search payroll, employees..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-100/50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-900 pl-10 pr-4 py-1.5 rounded-lg border border-slate-200 focus:border-indigo-655 focus:border-indigo-600 focus:outline-none transition-all duration-150 font-display"
          />
        </div>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0" id="header-actions">
        {/* Theme Toggle Button */}
        <button
          id="btn-theme-toggle"
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all font-display cursor-pointer"
          title={theme === 'light' ? 'Switch to Night Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notifications-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all font-display relative"
            title="Compliance Alerts"
          >
            <Bell className="w-5 h-5" />
            {activeAlerts.length > 0 && (
              <span 
                id="notifications-badge"
                className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm font-sans" 
              >
                {activeAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-[340px] bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="px-4 py-2 border-b border-slate-100 font-bold text-xs text-slate-900 flex justify-between items-center font-display">
                <span>Compliance Alerts ({activeAlerts.length})</span>
                {activeAlerts.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    id="btn-clear-all-alerts"
                    className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:text-indigo-800 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="px-4 py-3 hover:bg-indigo-50/30 transition flex gap-3 relative cursor-pointer"
                      onClick={() => handleNotifClick(notif.linkToTab)}
                      id={`alert-item-${notif.id}`}
                    >
                      {/* Left icon marker */}
                      <div className="flex-shrink-0 mt-0.5">
                        {notif.type === 'payroll' ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <IndianRupee className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Msg Details */}
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5">
                          {notif.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-display leading-normal mt-0.5">{notif.text}</p>
                        <span className="text-[9px] font-semibold text-indigo-600/80 font-display block mt-1 uppercase tracking-wider">
                          Click to investigate • {notif.time}
                        </span>
                      </div>

                      {/* Dismiss X button */}
                      <button
                        onClick={(e) => handleDismissNotif(notif.id, e)}
                        className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                        title="Dismiss Alert"
                        id={`btn-dismiss-${notif.id}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 font-display">All Clear</p>
                    <p className="text-[11px] text-slate-400 font-display text-center max-w-[200px]">
                      No active payroll batches or timesheet exceptions require immediate review.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Firebase Authentication & Live Sync Status */}
        <div className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 rounded-lg p-1 px-1.5 sm:px-2.5 text-xs font-display flex-shrink-0" id="db-sync-card">
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Cloud className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-bounce' : 'animate-pulse'}`} />
                <span className="hidden md:inline">Cloud Sync</span>
              </span>
              <div className="h-3 w-[1px] bg-slate-300 hidden md:block" />
              <span className="text-slate-655 text-slate-600 font-medium truncate max-w-[60px] sm:max-w-[100px] hidden sm:inline" title={currentUser.email || ""}>
                {currentUser.displayName || currentUser.email}
              </span>
              <button 
                onClick={onLogout}
                title="Disconnect from Firebase Sync"
                className="hover:text-red-650 hover:bg-red-50 text-slate-500 font-bold p-1 rounded transition duration-150 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Sandbox</span>
              </span>
              <div className="h-3 w-[1px] bg-slate-200 hidden md:block" />
              <button 
                onClick={onLogin}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-1.5 sm:px-2.5 rounded text-[10px] uppercase tracking-wider transition duration-150 cursor-pointer flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-6 bg-slate-200" />

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            id="period-selector-btn"
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-1.5 transition-all text-sm font-semibold font-display text-slate-800"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showPeriodDropdown && (
            <div 
              id="period-dropdown-menu"
              className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {periods.map((period) => (
                <button
                  key={period}
                  id={`period-option-${period.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => {
                    onPeriodChange(period);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold font-display transition duration-150 flex items-center justify-between ${
                    selectedPeriod === period 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{period}</span>
                  {selectedPeriod === period && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
