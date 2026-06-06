/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  Calendar, 
  CheckSquare, 
  ChevronRight, 
  ArrowUpRight, 
  AlertCircle,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Employee, PayrollBatch, PayoutLog, SystemSettings, AttendanceRecord } from '../types';
import { formatCurrency, formatDateTime } from '../utils';

interface DashboardSectionProps {
  employees: Employee[];
  attendanceLogs: AttendanceRecord[];
  activeBatch: PayrollBatch;
  payoutLogs: PayoutLog[];
  settings: SystemSettings;
  onTabChange: (tab: string) => void;
}

export default function DashboardSection({
  employees,
  attendanceLogs,
  activeBatch,
  payoutLogs,
  settings,
  onTabChange
}: DashboardSectionProps) {
  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Confirm Laura Hales Overtime Hours for Oct run', completed: false },
    { id: 2, text: 'Validate SVB secure API encryption key', completed: true },
    { id: 3, text: 'Send digital payslips to Design department', completed: false },
    { id: 4, text: 'Update federal pension withholding rate in Settings', completed: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodoList(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const activeEmployeesCount = employees.filter(e => e.status === 'Active').length;
  const averageSalary = employees.reduce((acc, e) => acc + e.baseSalary, 0) / (employees.length || 1);

  // Base date resolves either the latest log or today's date
  const getBaseDate = () => {
    if (attendanceLogs.length > 0) {
      const parts = attendanceLogs[0].date.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    return new Date();
  };

  const baseDate = getBaseDate();
  const activeEmployees = employees.filter(e => e.status === 'Active');
  
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    const shortDate = d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
    
    const dayLogs = attendanceLogs.filter(log => log.date === dateStr);
    
    const presentLogs = dayLogs.filter(log => {
      const isEmpActive = activeEmployees.some(emp => emp.id === log.employeeId);
      return isEmpActive && log.status !== 'Absent';
    });
    
    const uniquePresentIds = new Set(presentLogs.map(log => log.employeeId));
    const presentCount = uniquePresentIds.size;
    const absentCount = Math.max(0, activeEmployees.length - presentCount);
    
    chartData.push({
      date: dateStr,
      day: `${dayName} ${shortDate}`,
      Present: presentCount,
      Absent: absentCount,
    });
  }

  const totalPresentSum = chartData.reduce((acc, d) => acc + d.Present, 0);
  const totalDaysCalculated = chartData.length;
  const avgPresencePercent = activeEmployees.length > 0
    ? Math.round((totalPresentSum / (activeEmployees.length * totalDaysCalculated)) * 100)
    : 0;

  return (
    <div className="space-y-6 pt-16 pr-4 pb-12" id="dashboard-workspace">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" id="dashboard-welcome">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-display" id="lbl-welcome-title">Enterprise Dashboard</h2>
          <p className="text-sm text-slate-500 font-display mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{settings.authorizedOfficerName}</span>. System gateway and compliance logs are active.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono tracking-wide bg-slate-100 border border-slate-200 px-3 py-1 rounded-md" id="lbl-last-sync">
          Last Verified: {formatDateTime(settings.lastSyncTime)}
        </div>
      </div>

      {/* Bento Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="dashboard-bento-grid">
        {/* Core headcount card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm" id="bento-card-employees">
          <div className="space-y-1 font-display">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Headcount</span>
            <span className="text-2xl font-bold text-slate-900 block">{activeBatch.totalEmployees}</span>
            <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-0.5">
              <span>+3.2% vs Q3 Run</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Current Active Payroll run value */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm" id="bento-card-gross">
          <div className="space-y-1 font-display">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Payroll Budget</span>
            <span className="text-2xl font-bold text-slate-900 block">{formatCurrency(activeBatch.netAmount)}</span>
            <span className="text-[10px] text-indigo-600 font-bold block">
              Status: <span className="underline">{activeBatch.status}</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Average Compensation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm" id="bento-card-avg-salary">
          <div className="space-y-1 font-display">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg Salary (Engineering)</span>
            <span className="text-2xl font-bold text-slate-900 block">{formatCurrency(averageSalary)}</span>
            <span className="text-[10px] text-slate-400 block">Calculated dynamically</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50/70 flex items-center justify-center text-amber-700">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Clock In Compliance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm" id="bento-card-hours">
          <div className="space-y-1 font-display">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Timesheet Approvals</span>
            <span className="text-2xl font-bold text-slate-900 block">98.4%</span>
            <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-0.5">
              <span>96/98 submissions cleared</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50/70 flex items-center justify-center text-emerald-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-grid-content">
        
        {/* Left Span: Todo List & System Alerts */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6" id="dashboard-grid-left">

          {/* Weekly Attendance Trends Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm" id="dashboard-attendance-trends-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Weekly Attendance Trends</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 font-display">
                Last 7 Active Days
              </span>
            </div>

            <div className="h-64 pt-2 font-display text-xs" id="chart-container-attendance">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '8px', 
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                    labelStyle={{ fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                  />
                  <Bar 
                    dataKey="Present" 
                    name="Present" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                  <Bar 
                    dataKey="Absent" 
                    name="Absent" 
                    fill="#cbd5e1" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3" id="trends-mini-metrics">
              <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100/60">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Weekly Avg Presence</span>
                <span className="text-sm font-bold text-slate-800">{avgPresencePercent}%</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100/60">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Active Directory</span>
                <span className="text-sm font-bold text-indigo-700">{activeEmployees.length} Staff</span>
              </div>
            </div>
          </div>
          
          {/* Action List Checklists */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm" id="dashboard-todo-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Administrative Checklist</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 font-display">
                {todoList.filter(t => t.completed).length}/{todoList.length} Tasks Locked
              </span>
            </div>

            <div className="space-y-2.5" id="todo-items-list">
              {todoList.map((todo) => (
                <button
                  key={todo.id}
                  id={`todo-item-${todo.id}`}
                  onClick={() => toggleTodo(todo.id)}
                  className="w-full flex items-center gap-3.5 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition text-left"
                >
                  <span 
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                      todo.completed 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {todo.completed && <span className="text-[9px]">✔</span>}
                  </span>
                  <span className={`text-xs font-semibold font-display ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {todo.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Module Shortcut links */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-50/70 to-indigo-100/40 shadow-xs" id="shortcut-banner-card">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-indigo-950 font-display flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>Ready to execute {activeBatch.period} payroll?</span>
              </h4>
              <p className="text-[11px] text-indigo-800/80 font-display leading-relaxed">
                All employee hours are compiled. The secure Silicon Valley Bank ACH payout gateway is authorized.
              </p>
            </div>
            
            <button
              id="banner-btn-payroll"
              onClick={() => onTabChange('payroll')}
              className="flex items-center gap-1 text-[11px] font-bold font-display bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              <span>Launch Payroll Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Span: Bank Log Transactions */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6" id="dashboard-grid-right">
          
          {/* SVB Bank Transfer Logs */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm" id="bank-transfers-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Transaction Log Ledger</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">
                SVB Active
              </span>
            </div>

            <div className="space-y-3.5" id="transaction-logs-list">
              {payoutLogs.length === 0 ? (
                <div className="py-8 text-center" id="transaction-empty-state">
                  <p className="text-xs text-slate-400 font-display">No bank payouts completed this season.</p>
                  <p className="text-[10px] text-slate-400 font-display mt-0.5">Complete a batch run to trigger ACH ledger entries.</p>
                </div>
              ) : (
                payoutLogs.map((log) => (
                  <div 
                    key={log.id} 
                    id={`tx-log-${log.id}`}
                    className="p-3 border border-slate-100 bg-slate-50/40 rounded-lg space-y-2 hover:border-slate-200 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 font-display">{log.batchName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Ref: {log.referenceNumber}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 font-mono">
                        {formatCurrency(log.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-display pt-1 border-t border-slate-100 border-dashed">
                      <span>Authorized: {log.authorizedBy}</span>
                      <span>{new Date(log.authorizedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
