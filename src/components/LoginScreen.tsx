/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, Key, ArrowRight, Building, Briefcase, Sun, Moon } from 'lucide-react';
import { Employee } from '../types';

interface LoginScreenProps {
  employees: Employee[];
  onLoginSuccess: (session: {
    role: 'ADMIN' | 'EMPLOYEE';
    employeeId?: string;
    userName: string;
    userRole: string;
  }) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function LoginScreen({ employees, onLoginSuccess, theme, onToggleTheme }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'employee'>('admin');
  
  // Admin Form States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Employee Form States
  const [employeeId, setEmployeeId] = useState('');
  const [employeePin, setEmployeePin] = useState('');
  const [employeeError, setEmployeeError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const trimmedUser = adminUsername.trim().toLowerCase();
    const trimmedPass = adminPassword.trim();

    // Accept admin/admin or admin@lonovo.inc/admin123 as valid administrator credentials
    if (
      (trimmedUser === 'admin' && trimmedPass === 'admin') ||
      (trimmedUser === 'admin@lonovo.inc' && (trimmedPass === 'admin123' || trimmedPass === 'admin'))
    ) {
      onLoginSuccess({
        role: 'ADMIN',
        userName: 'Aditya Trivedi',
        userRole: 'ADMINISTRATOR'
      });
    } else {
      setAdminError('Invalid administrator credentials. Try username: admin, password: admin');
    }
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError('');

    const trimmedId = employeeId.trim();
    const trimmedPin = employeePin.trim();

    const employee = employees.find(emp => emp.id === trimmedId);

    if (!employee) {
      setEmployeeError('No registered employee found with this ID.');
      return;
    }

    if (employee.status === 'Inactive') {
      setEmployeeError('This employee account is suspended. Contact Compliance Admin.');
      return;
    }

    // Default passcode is the employee ID
    const expectedPin = employee.passcode || employee.id;
    if (trimmedPin !== expectedPin) {
      setEmployeeError('Invalid PIN code. Access denied.');
      return;
    }

    onLoginSuccess({
      role: 'EMPLOYEE',
      employeeId: employee.id,
      userName: employee.name,
      userRole: employee.role
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-display selection:bg-indigo-500/30 selection:text-white" id="login-container">
      {/* Background Abstract Glow Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200" id="login-card">
        
        {/* Theme Toggler */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer border border-slate-200"
          title={theme === 'light' ? 'Switch to Night Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Brand Banner */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-2">
            <Building className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">LONOVO.INC</h1>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 border border-slate-200 rounded-2xl mb-6" id="login-tabs">
          <button
            type="button"
            id="tab-btn-admin"
            onClick={() => setActiveTab('admin')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Gateway</span>
          </button>
          
          <button
            type="button"
            id="tab-btn-employee"
            onClick={() => setActiveTab('employee')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'employee'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Employee Hub</span>
          </button>
        </div>

        {/* Admin Login Tab Panel */}
        {activeTab === 'admin' && (
          <div className="space-y-5" id="panel-admin-login animate-in fade-in duration-150">
            {adminError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-350 text-xs rounded-xl flex items-start gap-2.5" id="admin-login-error">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-455 text-rose-400" />
                <span className="text-rose-300 leading-normal font-semibold">{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4" id="frm-admin-signin">
              <div className="space-y-1.5">
                <label htmlFor="admin-user" className="text-xs font-bold text-slate-400 block">Admin Username / Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="admin-user"
                    type="text"
                    required
                    placeholder="e.g. admin@lonovo.inc"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-3 py-3 bg-slate-50/50 focus:bg-white transition duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-pass" className="text-xs font-bold text-slate-400 block">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="admin-pass"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-3 py-3 bg-slate-50/50 focus:bg-white transition duration-150"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-admin-submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-600 text-white p-3 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer mt-3 bg-indigo-600 hover:bg-indigo-500"
              >
                <span>Access Dashboard Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="border-t border-slate-200 pt-4" id="admin-quick-login-assist">
              <button
                type="button"
                id="btn-quick-admin"
                onClick={() => {
                  setAdminUsername('admin@lonovo.inc');
                  setAdminPassword('admin');
                }}
                className="w-full py-2.5 px-4 border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-50 hover:bg-indigo-100/50 text-indigo-650 text-indigo-600 rounded-xl text-[10.5px] font-bold tracking-wide transition duration-150 cursor-pointer uppercase flex items-center justify-center gap-1.5"
              >
                ⚡ Quick Demo Admin Sign In
              </button>
            </div>
          </div>
        )}

        {/* Employee Login Tab Panel */}
        {activeTab === 'employee' && (
          <div className="space-y-5" id="panel-employee-login animate-in fade-in duration-150">
            {employeeError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-350 text-xs rounded-xl flex items-start gap-2.5" id="employee-login-error">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="text-rose-300 leading-normal font-semibold">{employeeError}</span>
              </div>
            )}

            <form onSubmit={handleEmployeeSubmit} className="space-y-4" id="frm-employee-signin">
              <div className="space-y-1.5">
                <label htmlFor="employee-id" className="text-xs font-bold text-slate-400 block">Employee ID Code</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="employee-id"
                    type="text"
                    required
                    placeholder="e.g. 10042"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-3 py-3 bg-slate-50/50 focus:bg-white transition duration-150 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="employee-pin" className="text-xs font-bold text-slate-400 block">Security PIN</label>
                  <span className="text-[9.5px] text-slate-500">Default PIN is same as ID</span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="employee-pin"
                    type="password"
                    required
                    placeholder="••••••"
                    value={employeePin}
                    onChange={(e) => setEmployeePin(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-3 py-3 bg-slate-50/50 focus:bg-white transition duration-150"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-employee-submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer mt-3"
              >
                <span>Unlock Employee Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick selectors for Employee sandbox demo */}
            <div className="border-t border-slate-200 pt-4" id="employee-quick-login-assist">
              <span className="text-[9.5px] font-bold text-indigo-600 uppercase tracking-wider block mb-2 text-center">Frictionless Sandbox Selectors</span>
              <div className="grid grid-cols-2 gap-2">
                {employees.slice(0, 4).map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    id={`btn-quick-emp-${emp.id}`}
                    onClick={() => {
                      setEmployeeId(emp.id);
                      setEmployeePin(emp.passcode || emp.id);
                    }}
                    className="py-1.5 px-2.5 border border-slate-200 hover:border-indigo-500/25 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold text-left truncate transition duration-150 cursor-pointer"
                    title={`Login as ${emp.name}`}
                  >
                    🚪 {emp.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security audits note */}
        <p className="text-[9px] text-center text-slate-650 text-slate-500 font-semibold mt-6 uppercase tracking-wider">
          Compliance logs active • IP handshake tracked
        </p>

      </div>
    </div>
  );
}
