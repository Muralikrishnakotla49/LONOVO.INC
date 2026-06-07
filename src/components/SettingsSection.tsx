/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Percent, 
  TrendingUp, 
  ShieldAlert, 
  Building2, 
  FileCheck,
  Save
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsSectionProps {
  settings: SystemSettings;
  onUpdateSettings: (updates: Partial<SystemSettings>) => void;
}

export default function SettingsSection({
  settings,
  onUpdateSettings
}: SettingsSectionProps) {
  
  const [compName, setCompName] = useState(settings.companyName);
  const [overtimeMult, setOvertimeMult] = useState(settings.overtimeMultiplier.toString());
  const [taxRate, setTaxRate] = useState(settings.taxRatePercent.toString());
  const [healthPercent, setHealthPercent] = useState(settings.healthInsurancePercent.toString());
  const [pensionPercent, setPensionPercent] = useState(settings.pensionPercent.toString());
  const [officerName, setOfficerName] = useState(settings.authorizedOfficerName);
  const [officerRole, setOfficerRole] = useState(settings.authorizedOfficerRole);
  const [bankConn, setBankConn] = useState(settings.svbBankConnected);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      companyName: compName,
      overtimeMultiplier: Number(overtimeMult),
      taxRatePercent: Number(taxRate),
      healthInsurancePercent: Number(healthPercent),
      pensionPercent: Number(pensionPercent),
      authorizedOfficerName: officerName,
      authorizedOfficerRole: officerRole,
      svbBankConnected: bankConn,
      lastSyncTime: new Date().toISOString()
    });
    alert("ClockWork AI: System Settings and bank payload rules saved successfully!");
  };

  return (
    <div className="space-y-6 pt-16 pr-4 pb-12 font-display" id="settings-workspace">
      
      {/* Settings layout header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight" id="lbl-settings-title">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Adjust compliance thresholds, regulate overtime indices, and configure third-party partner financial connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="settings-grid-layout">
        
        {/* Left column Settings Panels */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-8 space-y-6" id="frm-settings-configs">
          
          {/* Section 1: Payroll Rules parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm" id="settings-rules-panel">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3" id="settings-rules-title">
              <Percent className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Withholding & Overtime Formula</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="settings-rules-input-grid">
              
              {/* Co Name */}
              <div className="space-y-1">
                <label htmlFor="input-settings-coname" className="text-xs font-bold text-slate-500 block">Organization Name</label>
                <input
                  id="input-settings-coname"
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition"
                />
              </div>

              {/* Overtime Mult */}
              <div className="space-y-1">
                <label htmlFor="input-settings-multiplier" className="text-xs font-bold text-slate-500 block">Overtime Double Multiplier (x)</label>
                <input
                  id="input-settings-multiplier"
                  type="number"
                  step="0.1"
                  required
                  value={overtimeMult}
                  onChange={(e) => setOvertimeMult(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition font-mono"
                />
              </div>

              {/* Tax rate */}
              <div className="space-y-1">
                <label htmlFor="input-settings-tax" className="text-xs font-bold text-slate-550 block font-display">Standard Tax Threshold (%)</label>
                <input
                  id="input-settings-tax"
                  type="number"
                  step="0.01"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition font-mono"
                />
              </div>

              {/* Pension withhold */}
              <div className="space-y-1">
                <label htmlFor="input-settings-pension" className="text-xs font-bold text-slate-400 block font-display">Pension Deductions Contribution (%)</label>
                <input
                  id="input-settings-pension"
                  type="number"
                  step="0.01"
                  required
                  value={pensionPercent}
                  onChange={(e) => setPensionPercent(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition font-mono"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Authorizer profiles and certifying signs */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm" id="settings-officer-panel">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3" id="settings-officer-title">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Certifying Compliance Officer</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="settings-officer-grid">
              
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="input-settings-officer" className="text-xs font-bold text-slate-500 block">Signatory Official Name</label>
                <input
                  id="input-settings-officer"
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition"
                />
              </div>

              {/* Role title */}
              <div className="space-y-1">
                <label htmlFor="input-settings-officer-role" className="text-xs font-bold text-slate-550 block font-display">Signatory Official Role</label>
                <input
                  id="input-settings-officer-role"
                  type="text"
                  required
                  value={officerRole}
                  onChange={(e) => setOfficerRole(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition"
                />
              </div>

            </div>
          </div>

          {/* Save trigger */}
          <div className="flex items-center justify-end" id="settings-trigger-save-box">
            <button
              type="submit"
              id="btn-settings-save"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm transition text-xs font-display cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>

        </form>

        {/* Right Column: Third-Party Banking rail toggles */}
        <div className="lg:col-span-4 space-y-6" id="settings-right-panel">
          
          {/* SVB Banking Connection Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm" id="svb-partner-card">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3" id="svb-partner-title">
              <Building2 className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Core Clearings & Partners</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enable standard direct clearing integrations. When active, authorized nets can transfer directly using ACH structures.
            </p>

            <div className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/55 rounded-lg" id="settings-svb-toggle-container">
              <div>
                <h4 className="text-xs font-bold text-slate-800">State Bank of India</h4>
                <p className="text-[10px] text-slate-400">Secure XML ACH Handshakes</p>
              </div>

              {/* Slide Button */}
              <button
                type="button"
                id="btn-settings-toggle-svb"
                onClick={() => {
                  setBankConn(!bankConn);
                  onUpdateSettings({ svbBankConnected: !bankConn });
                }}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-200 ${
                  bankConn ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-xs transition" />
              </button>
            </div>

            {/* Compliance Note */}
            <div className="bg-amber-55/65 border border-amber-200/65 rounded-lg p-3.5 flex items-start gap-2.5 text-amber-900" id="banking-compliance-note">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                <span className="font-bold">Banking Alert:</span> Adjusting tax frameworks requires double signoff protocol from compliance controllers. Verify all routing entries before releasing funds.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
