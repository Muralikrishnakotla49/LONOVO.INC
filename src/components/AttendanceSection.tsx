/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Calendar,
  UserPlus
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';

interface AttendanceSectionProps {
  employees: Employee[];
  attendanceLogs: AttendanceRecord[];
  onAddAttendanceLog: (log: AttendanceRecord) => void;
}

export default function AttendanceSection({
  employees,
  attendanceLogs,
  onAddAttendanceLog
}: AttendanceSectionProps) {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [punchType, setPunchType] = useState<'In' | 'Out'>('In');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Custom manual time states for full flexibility
  const [customTime, setCustomTime] = useState('09:00');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  // Real-time ticking Clock display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const matchedEmp = employees.find(emp => emp.id === selectedEmpId);
    if (!matchedEmp) return;

    // Helper to calculate status
    const hourVal = parseInt(customTime.split(':')[0], 10);
    const minuteVal = parseInt(customTime.split(':')[1], 10);
    let punchStatus: 'On Time' | 'Late' | 'Absent' | 'Half Day' = 'On Time';

    if (punchType === 'In') {
      if (hourVal > 9 || (hourVal === 9 && minuteVal > 15)) {
        punchStatus = 'Late';
      }
    }

    // Format display time
    const formattedHour = hourVal % 12 || 12;
    const ampm = hourVal >= 12 ? 'PM' : 'AM';
    const displayPunchTime = `${formattedHour}:${minuteVal.toString().padStart(2, '0')} ${ampm}`;

    const newLog: AttendanceRecord = {
      id: `att_${Math.floor(1000 + Math.random() * 9000).toString()}`,
      employeeId: matchedEmp.id,
      employeeName: matchedEmp.name,
      date: customDate,
      clockIn: punchType === 'In' ? displayPunchTime : '09:00 AM',
      clockOut: punchType === 'Out' ? displayPunchTime : '—',
      totalHours: punchType === 'Out' ? Math.max(1, Math.min(12, hourVal - 9)) : 8.0,
      status: punchStatus
    };

    onAddAttendanceLog(newLog);
    alert(`Success! Generated Attendance Punch ${punchType.toUpperCase()} for ${matchedEmp.name} as "${punchStatus}" status.`);
  };

  return (
    <div className="space-y-6 pt-16 pr-4 pb-12" id="attendance-workspace">
      
      {/* View Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-display" id="attendance-header-title">Timesheets & Hours</h2>
        <p className="text-sm text-slate-500 font-display mt-1">
          Monitor employee log compliance, record manual punches, and verify totals prior to initiating deductions.
        </p>
      </div>

      {/* Primary Layout columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="attendance-grid">
        
        {/* Left Side: Punch Terminal */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm" id="punch-terminal-card">
          <div className="flex items-center gap-2 border-b border-fold-subtle pb-3" id="punch-terminal-title">
            <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Electronic Clock-in Terminal</h3>
          </div>

          {/* Desktop Ticking Clock Widget */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-center space-y-1" id="digital-clock-widget">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display block">System Time</span>
            <span className="text-3xl font-black font-mono text-slate-800 tracking-wider block" id="lbl-clock-ticking">
              {currentTime.toLocaleTimeString()}
            </span>
            <span className="text-[10px] text-slate-400 font-display block">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Punch Submission Form */}
          <form onSubmit={handlePunchSubmit} className="space-y-4" id="frm-attendance-punch">
            {/* Choose Employee field */}
            <div className="space-y-1.5">
              <label htmlFor="select-punch-employee" className="text-xs font-bold text-slate-500 font-display block">Choose Employee</label>
              <select
                id="select-punch-employee"
                required
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full text-xs font-semibold font-display border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50/50 transition"
              >
                <option value="">-- Choose Employee to Punch --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} (ID: {emp.id})</option>
                ))}
              </select>
            </div>

            {/* Toggle punch trigger (IN vs OUT) */}
            <div className="space-y-1.5 flex flex-col">
              <span className="text-xs font-bold text-slate-500 font-display block">Punch Operation</span>
              <div className="grid grid-cols-2 gap-3" id="punch-in-out-toggle">
                <button
                  type="button"
                  id="tab-punch-in"
                  onClick={() => setPunchType('In')}
                  className={`py-2 px-4 rounded-lg font-bold text-xs font-display flex items-center justify-center gap-1.5 transition ${
                    punchType === 'In' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Clock In</span>
                </button>

                <button
                  type="button"
                  id="tab-punch-out"
                  onClick={() => setPunchType('Out')}
                  className={`py-2 px-4 rounded-lg font-bold text-xs font-display flex items-center justify-center gap-1.5 transition ${
                    punchType === 'Out' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Clock Out</span>
                </button>
              </div>
            </div>

            {/* Manual configuration fields */}
            <div className="grid grid-cols-2 gap-3" id="manual-punch-datefields">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 font-display block">Date</label>
                <input
                  id="input-punch-date"
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full text-xs font-semibold font-display border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-1.5 bg-slate-50/50 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 font-display block">Clock Time</label>
                <input
                  id="input-punch-time"
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full text-xs font-semibold font-display border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-1.5 bg-slate-50/50 transition"
                />
              </div>
            </div>

            {/* Action dispatch button */}
            <button
              type="submit"
              id="btn-attendance-submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs font-display transition pt-3 shadow-sm cursor-pointer"
            >
              Log Punch Event
            </button>
          </form>
        </div>

        {/* Right Side: Active Timesheet ledger logs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-sm" id="attendance-history-card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" id="attendance-history-header">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Attendance Transaction logs</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400 font-display">Real-time Tracker</span>
          </div>

          <div className="overflow-x-auto" id="attendance-table-wrapper">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-205">
                  <th className="py-2.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">Employee</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">Date</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">Clock In</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">Clock Out</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display text-right">Hours</th>
                  <th className="py-2.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-50/50 transition duration-150"
                  >
                    <td className="py-3 px-5 text-xs font-bold text-slate-800 font-display">{log.employeeName}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-500 font-mono">{log.date}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-500 font-display">{log.clockIn}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-500 font-display">{log.clockOut}</td>
                    <td className="py-3 px-4 text-xs font-bold font-mono text-slate-700 text-right">{log.totalHours}</td>
                    <td className="py-3 px-5 text-right font-display text-xs">
                      {log.status === 'On Time' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-emerald-100">On Time</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9A3412] bg-[#FFEDD5] px-2 py-0.5 rounded-full border border-orange-100">Late</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60" id="attendance-footer">
            <p className="text-[10px] text-slate-400 font-display text-center leading-relaxed">
              ClockWork AI auto-validates daily timesheet inputs. Late arrivals trigger automated fractional deduction calculations based on registered company policies.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
