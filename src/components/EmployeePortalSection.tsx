/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  Calendar, 
  Building, 
  CreditCard, 
  Lock, 
  Edit3, 
  Save, 
  Printer, 
  Briefcase, 
  LogOut,
  Mail,
  Phone,
  FileText,
  Bookmark,
  ShieldCheck
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { formatCurrency } from '../utils';

interface EmployeePortalSectionProps {
  employees: Employee[];
  attendanceLogs: AttendanceRecord[];
  onAddAttendanceLog: (log: AttendanceRecord) => void;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => Promise<void> | void;
  defaultEmpId?: string;
  onAppLogout?: () => void;
}

export default function EmployeePortalSection({
  employees,
  attendanceLogs,
  onAddAttendanceLog,
  onUpdateEmployee,
  defaultEmpId,
  onAppLogout
}: EmployeePortalSectionProps) {
  // Auth control states
  const [sessionEmpId, setSessionEmpId] = useState<string>(() => {
    return defaultEmpId || localStorage.getItem('clockwork_portal_emp_id') || '';
  });

  useEffect(() => {
    if (defaultEmpId) {
      setSessionEmpId(defaultEmpId);
    }
  }, [defaultEmpId]);
  const [loginIdInput, setLoginIdInput] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab routing within portal
  const [portalTab, setPortalTab] = useState<'attendance' | 'payroll' | 'profile'>('attendance');

  // Interactive profile edits
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form edit elements temp states
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [editBankRouting, setEditBankRouting] = useState('');

  // Clock in status details
  const [locationNote, setLocationNote] = useState('Primary Desk');
  const [successMsg, setSuccessMsg] = useState('');

  // Live clock run timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Retrieve current employee context from session
  const activeEmployee = employees.find(emp => emp.id === sessionEmpId);

  // Sync profile edits states when active employee changes/loads
  useEffect(() => {
    if (activeEmployee) {
      setEditEmail(activeEmployee.email || `${activeEmployee.name.toLowerCase().replace(/\s+/g, '')}@lonovo-inc.com`);
      setEditPhone(activeEmployee.phone || '+91 98765 43210');
      setEditAddress(activeEmployee.address || '4th Floor, Phase-2, HITEC City, Hyderabad, Telangana - 500081');
      setEditBankName(activeEmployee.bankName || 'State Bank of India (SBI)');
      setEditBankAccount(activeEmployee.bankAccount || '•••• •••• 4125');
      setEditBankRouting(activeEmployee.bankRouting || 'SBIN0001234');
    }
  }, [activeEmployee]);

  // Login handler routine
  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedId = loginIdInput.trim();
    const matched = employees.find(emp => emp.id === trimmedId);

    if (!matched) {
      setLoginError('No matching employee profile found in directory. Check your ID.');
      return;
    }

    // Verify passcode (if defined, else default to their ID)
    const expectedPasscode = matched.passcode || matched.id;
    if (loginPasscode && loginPasscode !== expectedPasscode) {
      setLoginError('Invalid credentials. Contact Compliance Administration.');
      return;
    }

    // Authorized
    setSessionEmpId(matched.id);
    localStorage.setItem('clockwork_portal_emp_id', matched.id);
    setLoginIdInput('');
    setLoginPasscode('');
  };

  const handlePortalLogout = () => {
    if (onAppLogout) {
      onAppLogout();
    } else {
      setSessionEmpId('');
      localStorage.removeItem('clockwork_portal_emp_id');
    }
  };

  // Find today's recorded attendances for this logging employee (in IST)
  const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const todayStr = dateFormatter.format(currentDate);
  const myAttendanceHistory = attendanceLogs.filter(log => log.employeeId === sessionEmpId);
  
  // Find today's actual log (if exists)
  const todayLog = myAttendanceHistory.find(log => log.date === todayStr);

  const handleClockIn = () => {
    if (!activeEmployee) return;

    // Formatter for IST time
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    const parts = timeFormatter.formatToParts(currentDate);
    const hourValStr = parts.find(p => p.type === 'hour')?.value || '9';
    const minuteValStr = parts.find(p => p.type === 'minute')?.value || '00';
    const dayPeriodValStr = parts.find(p => p.type === 'dayPeriod')?.value || 'AM';
    
    const hourVal = parseInt(hourValStr, 10);
    const minuteVal = parseInt(minuteValStr, 10);
    const ampm = dayPeriodValStr;
    
    let hour24 = hourVal;
    if (ampm === 'PM' && hourVal !== 12) hour24 += 12;
    if (ampm === 'AM' && hourVal === 12) hour24 = 0;

    let statusLabel: 'On Time' | 'Late' | 'Absent' | 'Half Day' = 'On Time';

    // Latency limit parameter is 09:15 AM
    if (hour24 > 9 || (hour24 === 9 && minuteVal > 15)) {
      statusLabel = 'Late';
    }

    // Format display punch in time
    const displayTime = `${hourVal}:${minuteVal.toString().padStart(2, '0')} ${ampm}`;

    const newLog: AttendanceRecord = {
      id: `att_${Math.floor(10000 + Math.random() * 90000).toString()}`,
      employeeId: activeEmployee.id,
      employeeName: activeEmployee.name,
      date: todayStr,
      clockIn: displayTime,
      clockOut: '—',
      totalHours: 0.0,
      status: statusLabel
    };

    onAddAttendanceLog(newLog);
    triggerSuccess(`Successfully Clocked IN today at ${displayTime} under status: ${statusLabel}.`);
  };

  const handleClockOut = () => {
    if (!activeEmployee || !todayLog) return;

    // Must update the existing log with out-time
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    const parts = timeFormatter.formatToParts(currentDate);
    const hourValStr = parts.find(p => p.type === 'hour')?.value || '5';
    const minuteValStr = parts.find(p => p.type === 'minute')?.value || '00';
    const dayPeriodValStr = parts.find(p => p.type === 'dayPeriod')?.value || 'PM';

    const hourVal = parseInt(hourValStr, 10);
    const minuteVal = parseInt(minuteValStr, 10);
    const ampm = dayPeriodValStr;
    
    const displayOutTime = `${hourVal}:${minuteVal.toString().padStart(2, '0')} ${ampm}`;

    // Attempt to calculate actual duration
    const inParts = todayLog.clockIn.split(' ');
    const [inH, inM] = inParts[0].split(':').map(Number);
    const inAmpm = inParts[1];
    
    let inHour24 = inH;
    if (inAmpm === 'PM' && inH !== 12) inHour24 += 12;
    if (inAmpm === 'AM' && inH === 12) inHour24 = 0;

    let outHour24 = hourVal;
    if (ampm === 'PM' && hourVal !== 12) outHour24 += 12;
    if (ampm === 'AM' && hourVal === 12) outHour24 = 0;
    
    // Compute fractional delta
    const inTotalHours = inHour24 + (inM / 60);
    const outTotalHours = outHour24 + (minuteVal / 60);
    const calculatedHours = Math.max(0.5, parseFloat((outTotalHours - inTotalHours).toFixed(2)));

    // Sync back
    const updatedRecord: AttendanceRecord = {
      ...todayLog,
      clockOut: displayOutTime,
      totalHours: calculatedHours
    };

    onAddAttendanceLog(updatedRecord);
    triggerSuccess(`Successfully Clocked OUT today at ${displayOutTime}. Hours computed: ${calculatedHours} hrs.`);
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmployee) return;

    setIsEditingProfile(true);
    await onUpdateEmployee(activeEmployee.id, {
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      bankName: editBankName,
      bankAccount: editBankAccount,
      bankRouting: editBankRouting
    });
    setIsEditingProfile(false);
    triggerSuccess('Personal account file details saved and synchronized in Core Database.');
  };

  // Printable Slip routine
  const handlePrintSlip = () => {
    window.print();
  };

  // Main login page view
  if (!activeEmployee) {
    return (
      <div className="pt-16 pr-4 pb-12 font-display flex flex-col items-center justify-center min-h-[75vh]" id="portal-login-viewport">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-8 shadow-md relative overflow-hidden" id="portal-login-card">
          
          {/* Visual banner highlight */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />

          {/* Header info */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Hub</h2>
            <p className="text-xs text-slate-500 font-medium">
              Access your personalized workspace, track timesheet hours, list payroll details, and certify compliance records.
            </p>
          </div>

          {/* Quick Demo Assist selectors for frictionless testing */}
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl mb-5 space-y-2" id="demo-credentials-helper">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Quick Demo Login Selector</span>
              <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold font-mono px-1.5 py-0.2 rounded">Saves Time</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              No need to look up codes manually. Pick any staff directory record below to load their individual portal workspace instantly:
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {employees.slice(0, 4).map(emp => (
                <button
                  id={`demo-login-${emp.id}`}
                  key={emp.id}
                  onClick={() => {
                    setLoginIdInput(emp.id);
                    setLoginPasscode(emp.passcode || emp.id);
                  }}
                  className="py-1 px-2 border border-slate-200 rounded text-[10px] font-semibold text-slate-705 text-left bg-white truncate hover:bg-indigo-50 hover:border-indigo-200"
                >
                  🚪 {emp.name} (ID: {emp.id})
                </button>
              ))}
            </div>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg flex items-center gap-2 mb-4" id="login-error-log">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handlePortalLogin} className="space-y-4" id="frm-portal-signin">
            <div className="space-y-1">
              <label htmlFor="portal-input-id" className="text-xs font-bold text-slate-600 block">Personal Employee Code / ID</label>
              <input
                id="portal-input-id"
                type="text"
                required
                placeholder="e.g. 10042"
                value={loginIdInput}
                onChange={(e) => setLoginIdInput(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition font-mono"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="portal-input-pass" className="text-xs font-bold text-slate-600 block">System PIN / Security Code</label>
                <span className="text-[9px] text-slate-400 font-medium">Default password is same as ID</span>
              </div>
              <input
                id="portal-input-pass"
                type="password"
                required
                placeholder="••••••"
                value={loginPasscode}
                onChange={(e) => setLoginPasscode(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition"
              />
            </div>

            <button
              id="btn-portal-submit-login"
              type="submit"
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 p-2.5 rounded-lg text-white font-semibold text-xs transition shadow-sm cursor-pointer mt-2"
            >
              Verify Credentials & Unlock Portal
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 font-medium mt-4">
            Security audits are logged automatically by Cloud Ingress Terminal rules.
          </p>

        </div>
      </div>
    );
  }

  // Active user data totals
  const totalOtWages = activeEmployee.overtimeHours * activeEmployee.overtimeRate;
  const grossPay = activeEmployee.baseSalary + totalOtWages;
  const totalTaxWithholding = grossPay * 0.12; // 12% standard Tax
  const healthWithholding = grossPay * 0.04; // 4% health coverage
  const pensionWithholding = activeEmployee.deductionRate; // Custom direct employee deduction value
  const netEarnings = grossPay - totalTaxWithholding - healthWithholding - pensionWithholding;

  return (
    <div className="space-y-6 pt-16 pr-4 pb-12 font-display" id="portal-dashboard-workspace">
      
      {/* Banner / Header Bar */}
      <div className="bg-white border border-slate-201 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm" id="portal-welcome-banner">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-indigo-700 ${activeEmployee.avatarColor || 'bg-indigo-100 text-indigo-700'}`}>
            {activeEmployee.initials || activeEmployee.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 font-mono">ID: {activeEmployee.id}</span>
              <span className="text-slate-400 font-black">•</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">{activeEmployee.status} Personnel</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1 leading-none">{activeEmployee.name}</h2>
            <p className="text-xs text-indigo-600 font-semibold mt-0.5">{activeEmployee.role} in {activeEmployee.department} Department</p>
          </div>
        </div>

        <button
          id="btn-portal-action-logout"
          onClick={handlePortalLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-red-650 hover:text-red-750 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Portal Workspace</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200 shadow-xs" id="portal-toast">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Portal Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-1.5" id="portal-interactive-sub-tabs">
        <button
          id="btn-subtab-attendance"
          onClick={() => setPortalTab('attendance')}
          className={`py-2 px-4 border-b-2 text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            portalTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily Attendance</span>
        </button>

        <button
          id="btn-subtab-payroll"
          onClick={() => setPortalTab('payroll')}
          className={`py-2 px-4 border-b-2 text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            portalTab === 'payroll'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-905'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>My Payslips & Payroll</span>
        </button>

        <button
          id="btn-subtab-profile"
          onClick={() => setPortalTab('profile')}
          className={`py-2 px-4 border-b-2 text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            portalTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-905'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account & Personal Details</span>
        </button>
      </div>

      {/* Main tab switch panels */}
      <div>
        
        {/* Tab 1: Attendance Workspace */}
        {portalTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="panel-tab-attendance">
            
            {/* Clock Terminal Controls */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-950">Daily Punch Terminal</h3>
              </div>

              {/* Ticking Clock Layout */}
              <div className="bg-slate-55 bg-indigo-50/20 border border-indigo-100 rounded-xl p-5 text-center space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-display">Live Terminal Time</span>
                <span className="text-3xl font-black font-mono text-indigo-750 tracking-wider block">
                  {currentDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
                </span>
                <span className="text-[10.5px] text-slate-500 block font-medium">
                  {currentDate.toLocaleDateString('en-US', {
                    timeZone: 'Asia/Kolkata',
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {/* Punch Operations buttons */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="input-portal-loc-note" className="text-xs font-bold text-slate-505 block">Terminal Note</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="input-portal-loc-note"
                      type="text"
                      value={locationNote}
                      onChange={(e) => setLocationNote(e.target.value)}
                      placeholder="e.g. Remote Workspace, Central Office"
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg bg-slate-50"
                    />
                  </div>
                </div>

                {/* Status Badge context */}
                <div className="p-3 bg-slate-55 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-700 text-xs">
                  {todayLog ? (
                    <div className="space-y-1.5" id="today-punch-badge">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Attendance Recorded Today</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        • In-Time: <span className="font-bold text-slate-800">{todayLog.clockIn}</span> <span className="text-[9.5px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.1 ml-1 rounded font-bold uppercase">{todayLog.status}</span>
                      </p>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        • Out-Time: <span className="font-bold text-slate-800">{todayLog.clockOut}</span>
                      </p>
                      {todayLog.clockOut !== '—' && (
                        <p className="text-[10.5px] font-bold text-indigo-700 shrink-0">
                          • Computed Hours: {todayLog.totalHours} hrs worked today.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      ⚠️ No attendance record found for today yet (<span className="font-bold">{todayStr}</span>). Press "Apply Daily Clock In" to log your system arrival time.
                    </p>
                  )}
                </div>

                {/* Trigger Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    id="btn-portal-clock-in"
                    type="button"
                    onClick={handleClockIn}
                    disabled={!!todayLog}
                    className="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 border border-transparent shadow-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Apply Clock In</span>
                  </button>

                  <button
                    id="btn-portal-clock-out"
                    type="button"
                    onClick={handleClockOut}
                    disabled={!todayLog || todayLog.clockOut !== '—'}
                    className="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer bg-white text-slate-700 border border-slate-300 hover:bg-slate-55 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                  >
                    <LogOut className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Apply Clock Out</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Attendance List */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="panel-personal-attendance-history">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-950 font-display">My Attendance Sheet History</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{myAttendanceHistory.length} Days Tracked</span>
                </div>

                {myAttendanceHistory.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-1">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold font-display">No timesheet records logged</p>
                    <p className="text-[10px] leading-tight">Your timesheet historical records will list here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <th className="py-2 px-3 font-bold text-slate-505 uppercase tracking-wider font-display">Date</th>
                          <th className="py-2 px-3 font-bold text-slate-505 uppercase tracking-wider font-display">Arrival Time</th>
                          <th className="py-2 px-3 font-bold text-slate-505 uppercase tracking-wider font-display">Departure Time</th>
                          <th className="py-2 px-3 font-bold text-slate-505 uppercase tracking-wider font-display">Logged Hours</th>
                          <th className="py-2 px-3 font-bold text-slate-505 uppercase tracking-wider font-display text-right">Punch Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myAttendanceHistory.map(rec => (
                          <tr key={rec.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-700 font-mono">{rec.date}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-600">{rec.clockIn}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-600">{rec.clockOut}</td>
                            <td className="py-2.5 px-3 font-extrabold text-slate-800 font-mono">{rec.clockOut === '—' ? 'In Progress' : `${rec.totalHours} hrs`}</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`text-[9px] font-extrabold font-display border uppercase px-2 py-0.5 rounded-full ${
                                rec.status === 'On Time'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : rec.status === 'Late'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : rec.status === 'Half Day'
                                  ? 'bg-orange-50 text-orange-700 border-orange-100'
                                  : 'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Personal Payroll Breakdown */}
        {portalTab === 'payroll' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="panel-tab-payroll">
            
            {/* Quick Metrics columns left */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Earnings Overview Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm" id="portal-earnings-overview">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <IndianRupee className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-905">Current Period Compensation</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Monthly Base Salary</span>
                    <span className="text-2xl font-black font-mono text-slate-800 leading-none">
                      {formatCurrency(activeEmployee.baseSalary)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block leading-tight">Overtime Hours</span>
                      <span className="text-sm font-extrabold text-indigo-650 font-mono">
                        {activeEmployee.overtimeHours.toFixed(1)} hrs
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block leading-tight">Ot Hourly Rate</span>
                      <span className="text-sm font-extrabold text-indigo-650 font-mono">
                        {formatCurrency(activeEmployee.overtimeRate)}/hr
                      </span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100" />

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Gross Premium (Est)</span>
                    <span className="font-extrabold text-slate-900 font-mono">{formatCurrency(grossPay)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-red-650">
                    <span className="font-semibold text-slate-500">Aggregate Deductions</span>
                    <span className="font-extrabold font-mono">-{formatCurrency(totalTaxWithholding + healthWithholding + pensionWithholding)}</span>
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">Estimated Net Payout</span>
                      <span className="text-xl font-black font-mono text-indigo-700 leading-none block mt-1">
                        {formatCurrency(netEarnings)}
                      </span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">NET TO BANK</span>
                  </div>
                </div>
              </div>

              {/* Direct deposit bank information widget */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Clearance Banking Details</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Clearing Bank:</span>
                    <span className="font-bold text-slate-800">{activeEmployee.bankName || 'State Bank of India (SBI)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Number:</span>
                    <span className="font-bold font-mono text-slate-800">{activeEmployee.bankAccount || '•••• •••• 4125'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IFSC Code:</span>
                    <span className="font-bold font-mono text-slate-800">{activeEmployee.bankRouting || 'SBIN0001234'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-405 text-slate-400 leading-tight">
                  Account is linked via SBI XML Core clearing protocols. For bank routing changes, request double-signed compliance update in Profile.
                </p>
              </div>

            </div>

            {/* Premium printable Payslip statement on right */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6" id="printed-pay-slip-holder">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800">Direct Deposit Electronic Payslip Statement</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    id="btn-print-payslip"
                    onClick={handlePrintSlip}
                    className="flex items-center gap-1.5 bg-slate-55 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-[11px] cursor-pointer transition shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Payslip</span>
                  </button>
                </div>
              </div>

              {/* Visual Printable payslip template wrapper */}
              <div className="p-8 border border-slate-300 rounded-xl space-y-6 font-mono text-xs bg-slate-50/10 shadow-inner" id="printable-payslip">
                
                {/* Payslip Header */}
                <div className="flex justify-between items-start border-b border-slate-350 border-slate-320 pb-4">
                  <div>
                    <h4 className="text-sm font-black tracking-widest text-slate-800">LONOVO.INC PAYROLL DEPT</h4>
                    <span className="text-[10px] text-slate-400">State Bank of India, Corporate Centre, Madame Cama Road, Mumbai - 400021</span>
                    <div className="text-[10px] text-indigo-600 font-bold mt-1 uppercase">ESTABLISHED DEPOSIT AUDIT TRAIL</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Statement No:</span>
                    <span className="font-bold text-slate-800 block">LNV-PAY-{(activeEmployee.id + "09153").substring(0, 8)}</span>
                    <span className="text-[10.5px] text-slate-500 font-bold font-sans block mt-1 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded tracking-tight">Active Batch Slip</span>
                  </div>
                </div>

                {/* Info block columns */}
                <div className="grid grid-cols-2 gap-6 text-[10.5px] pb-4 border-b border-dashed border-slate-200">
                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-400 block uppercase">Associate Name:</span>
                      <span className="font-bold text-slate-800 uppercase">{activeEmployee.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">Employee Identifier Code:</span>
                      <span className="font-bold text-slate-800 font-mono">{activeEmployee.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">Department & Role:</span>
                      <span className="font-bold text-indigo-750 uppercase">{activeEmployee.role} ({activeEmployee.department})</span>
                    </div>
                  </div>

                  <div className="space-y-1 md:pl-6">
                    <div>
                      <span className="text-slate-400 block uppercase">Clearance Period:</span>
                      <span className="font-bold text-slate-800 uppercase">CURRENT PAY CYCLE</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">Bank Routing transit:</span>
                      <span className="font-bold text-slate-800 font-mono">{activeEmployee.bankRouting || '021000021'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">Deposit Account:</span>
                      <span className="font-bold text-slate-800 font-mono">{activeEmployee.bankAccount || '•••• •••• 4125'}</span>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions breakdown side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs pt-2">
                  {/* Earnings */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-indigo-700 tracking-wider uppercase border-b border-slate-200 pb-1 font-sans">Itemized Gross Earnings</h5>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Base Salary Contract</span>
                        <span className="font-bold font-mono text-slate-800">{formatCurrency(activeEmployee.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime Work ({activeEmployee.overtimeHours.toFixed(1)}h)</span>
                        <span className="font-bold font-mono text-slate-800">{formatCurrency(totalOtWages)}</span>
                      </div>
                      <div className="flex justify-between text-indigo-700 font-bold font-mono pt-1 border-t border-slate-100">
                        <span>TOTAL EARNINGS (GROSS)</span>
                        <span>{formatCurrency(grossPay)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-red-700 tracking-wider uppercase border-b border-slate-200 pb-1 font-sans">Itemized Deductions</h5>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between text-red-650">
                        <span>Federal Withholding Tax (12%)</span>
                        <span className="font-bold font-mono">-{formatCurrency(totalTaxWithholding)}</span>
                      </div>
                      <div className="flex justify-between text-red-650">
                        <span>Health Insurance Coverage (4%)</span>
                        <span className="font-bold font-mono">-{formatCurrency(healthWithholding)}</span>
                      </div>
                      <div className="flex justify-between text-red-650">
                        <span>Pension Fund / Provident</span>
                        <span className="font-bold font-mono">-{formatCurrency(pensionWithholding)}</span>
                      </div>
                      <div className="flex justify-between text-red-700 font-bold font-mono pt-1 border-t border-slate-100">
                        <span>TOTAL WITHHOLDINGS</span>
                        <span>-{formatCurrency(totalTaxWithholding + healthWithholding + pensionWithholding)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Net Box Bottom */}
                <div className="bg-indigo-900 text-white rounded-lg p-4 font-sans flex justify-between items-center mt-6 shadow-sm">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-200 tracking-widest block leading-tight">Net Direct Deposit Handshake</span>
                    <span className="text-xs text-indigo-300 block">Calculated Net funds cleared for automated routing</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono tracking-tight block">{formatCurrency(netEarnings)}</span>
                  </div>
                </div>

                {/* Sign-off footer inside template */}
                <div className="flex justify-between items-end pt-6 text-[10px] text-slate-400">
                  <div className="space-y-1 font-sans">
                    <div>Authorized Compliance: <span className="font-bold text-slate-600">LONOVO Audit Automated Handshake</span></div>
                    <div>Compliance Standard: <span className="font-bold text-slate-600">SBI ACH Secured HANDSHAKE V2.4</span></div>
                  </div>
                  
                  <div className="text-right border-t border-slate-300 w-44 pt-1 font-sans font-bold text-slate-500">
                    Compliance Certification
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3.5 text-[11px] text-amber-800">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Compliance Note:</strong> This statement is fully verified and aligned with federal guidelines. To update tax settings or check historically closed pay batches, contact the HR administrator directly.
                </span>
              </div>

            </div>

          </div>
        )}

        {/* Tab 3: Update Profile & Account */}
        {portalTab === 'profile' && (
          <form onSubmit={handleSaveProfileDetails} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="panel-tab-profile">
            
            {/* Account Info Left Pane */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm" id="profile-immutable-sidebar">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-4 h-4 text-indigo-650" />
                <h3 className="text-sm font-bold text-slate-905">System Contract Registry</h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 font-display">
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Employee ID Code</span>
                  <span className="font-bold font-mono text-slate-800">{activeEmployee.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Contract Status</span>
                  <span className="font-bold text-emerald-600 uppercase tracking-wider">{activeEmployee.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Company Department</span>
                  <span className="font-bold text-slate-800">{activeEmployee.department}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Designated Role</span>
                  <span className="font-bold text-slate-800">{activeEmployee.role}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-semibold">Contract Compensation</span>
                  <span className="font-bold text-slate-800 font-mono">${activeEmployee.baseSalary.toLocaleString()}/mo</span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3.5 flex items-start gap-2 text-indigo-800 text-[10.5px]">
                <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <p className="leading-tight">
                  Registry contracts are managed by the certifying compliance officer. Updates to job roles, base salary arrays, or department assignments require a double-approver override.
                </p>
              </div>
            </div>

            {/* Editable Profile Information Form on right */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5" id="profile-editable-form-panel">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-905">Update Personal Details & Banking Handshakes</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="profile-form-fields-container">
                
                {/* Email field */}
                <div className="space-y-1">
                  <label htmlFor="pf-email" className="text-xs font-bold text-slate-505 block">Personal/Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="pf-email"
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg bg-slate-55/40 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Phone field */}
                <div className="space-y-1">
                  <label htmlFor="pf-phone" className="text-xs font-bold text-slate-505 block">Mobile/Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="pf-phone"
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg bg-slate-55/40 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Home address info */}
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="pf-address" className="text-xs font-bold text-slate-505 block">Physical Mailing Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="pf-address"
                      type="text"
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg bg-slate-55/40 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Bank Name field */}
                <div className="space-y-1">
                  <label htmlFor="pf-bank-name" className="text-xs font-bold text-slate-505 block font-sans">Deposit Bank Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="pf-bank-name"
                      type="text"
                      required
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg bg-slate-55/40 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Account Number field */}
                <div className="space-y-1">
                  <label htmlFor="pf-bank-acc" className="text-xs font-bold text-slate-505 block font-sans">Bank Account Number (Routing Handshake)</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="pf-bank-acc"
                      type="text"
                      required
                      value={editBankAccount}
                      onChange={(e) => setEditBankAccount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg bg-slate-55/40 bg-slate-50 font-mono"
                    />
                  </div>
                </div>

                {/* Bank Routing transit */}
                <div className="space-y-1">
                  <label htmlFor="pf-bank-rout" className="text-xs font-bold text-slate-505 block font-sans">Direct clearing routing Number (9-digits ABA)</label>
                  <div className="relative">
                    <Bookmark className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="pf-bank-rout"
                      type="text"
                      required
                      maxLength={9}
                      value={editBankRouting}
                      onChange={(e) => setEditBankRouting(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg bg-slate-55/40 bg-slate-50 font-mono"
                    />
                  </div>
                </div>

              </div>

              {/* Action buttons profile */}
              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button
                  type="submit"
                  id="btn-profile-details-save"
                  disabled={isEditingProfile}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition text-xs font-sans cursor-pointer disabled:bg-indigo-305 disabled:bg-indigo-400"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditingProfile ? 'Syncing...' : 'Save and Coordinate Personal File'}</span>
                </button>
              </div>

            </div>

          </form>
        )}

      </div>

    </div>
  );
}
