/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Briefcase, 
  Plus, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  IndianRupee
} from 'lucide-react';
import { Employee } from '../types';
import { formatCurrency } from '../utils';

interface EmployeeSectionProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
}

export default function EmployeeSection({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}: EmployeeSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New employee states
  const [newName, setNewName] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newRole, setNewRole] = useState('');
  const [newOvertimeRate, setNewOvertimeRate] = useState('70');
  const [newDeductions, setNewDeductions] = useState('1100');

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.includes(searchQuery)
  );

  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSalary || !newRole) return;

    // Split initials
    const nameParts = newName.trim().split(/\s+/);
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].slice(0, 2).toUpperCase();

    // Random styling avatar background colors
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-emerald-100 text-emerald-700',
      'bg-orange-100 text-orange-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newId = (Math.floor(10000 + Math.random() * 90000)).toString();

    const createdEmp: Employee = {
      id: newId,
      name: newName,
      initials,
      avatarColor: randomColor,
      baseSalary: Number(newSalary),
      overtimeHours: 0,
      overtimeRate: Number(newOvertimeRate),
      deductionRate: Number(newDeductions),
      department: newDept,
      role: newRole,
      status: 'Active'
    };

    onAddEmployee(createdEmp);
    setShowAddModal(false);

    // Reset controls
    setNewName('');
    setNewSalary('');
    setNewRole('');
    alert(`Success! Employee candidate ${newName} successfully onboarded and assigned ID: ${newId}.`);
  };

  const handleToggleStatus = (id: string, currentStatus: 'Active' | 'Inactive') => {
    onUpdateEmployee(id, {
      status: currentStatus === 'Active' ? 'Inactive' : 'Active'
    });
  };

  return (
    <div className="space-y-6 pt-16 pr-4 pb-12" id="employee-workspace">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="employee-workspace-header">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-display" id="employee-title">Employee Directory</h2>
          <p className="text-sm text-slate-500 font-display mt-1">
            Manage worker compensation profiles, assign organizational units, and toggle system access options.
          </p>
        </div>

        {/* Create new employee button */}
        <button
          id="btn-trigger-add-employee"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition text-xs font-display cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {/* Directory Grid */}
      <div className="bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-sm" id="employee-directory-card">
        {/* Filter Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30">
          <div className="relative w-full sm:w-72" id="employee-local-search-container">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="employee-local-search"
              type="text"
              placeholder="Search directory by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold font-display border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg pl-9 pr-3 py-1.5 bg-white transition"
            />
          </div>
          <span className="text-xs text-slate-400 font-display font-semibold">
            {filteredEmployees.length} registered staff matching search
          </span>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto" id="employee-table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-205">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">Employee Details</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">Department</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">Base Compensation</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display text-center">System Logins</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display text-right">Delete Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-display" id="employee-directory-empty">
                    No corresponding employee credentials matched.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    id={`directory-row-${emp.id}`}
                    className="hover:bg-slate-50/50 transition duration-150"
                  >
                    {/* User profile avatar, name, and position */}
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${emp.avatarColor} font-bold text-xs flex items-center justify-center font-display`}>
                        {emp.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 font-display">{emp.name}</h4>
                        <p className="text-[10px] text-slate-400 font-display font-semibold">{emp.role}</p>
                      </div>
                    </td>

                    {/* Department badge columns */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 font-display">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-100 bg-slate-50 text-slate-700 text-[10px]">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{emp.department}</span>
                      </span>
                    </td>

                    {/* Standard base wage values */}
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-750 font-display">
                      {formatCurrency(emp.baseSalary)}
                    </td>

                    {/* Status credentials toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        id={`btn-toggle-status-${emp.id}`}
                        onClick={() => handleToggleStatus(emp.id, emp.status)}
                        className="inline-flex items-center gap-1.5 transition text-slate-500 hover:text-slate-900"
                        title={`Click to shift access state to ${emp.status === 'Active' ? 'Inactive' : 'Active'}`}
                      >
                        {emp.status === 'Active' ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 px-2 py-0.5 rounded-full border border-emerald-200 transition">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active System</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-full border border-slate-250 transition">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-350" />
                            <span>Suspended</span>
                          </div>
                        )}
                      </button>
                    </td>

                    {/* Quick remove action rows */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        id={`btn-delete-employee-${emp.id}`}
                        onClick={() => {
                          if (confirm(`Onboarding archives confirm. Delete data profile for ${emp.name}?`)) {
                            onDeleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-350 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard New Employee Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-150 p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-155" id="add-employee-modal">
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3" id="add-modal-title">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Onboard New Associate</h3>
                <p className="text-xs text-slate-400 font-display">Configure initial compensation guidelines</p>
              </div>
            </div>

            <form onSubmit={handleRegisterEmployee} className="space-y-4 font-display">
              
              {/* Full Name field */}
              <div className="space-y-1">
                <label htmlFor="input-emp-name" className="text-xs font-bold text-slate-500 block">Full Name</label>
                <input
                  id="input-emp-name"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition"
                />
              </div>

              {/* Department & Role row */}
              <div className="grid grid-cols-2 gap-3" id="modal-emp-grid-dept">
                <div className="space-y-1">
                  <label htmlFor="select-emp-dept" className="text-xs font-bold text-slate-500 block">Department</label>
                  <select
                    id="select-emp-dept"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-55 transition"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-emp-role" className="text-xs font-bold text-slate-500 block">Professional Title</label>
                  <input
                    id="input-emp-role"
                    type="text"
                    required
                    placeholder="e.g. Architect"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition"
                  />
                </div>
              </div>

              {/* Salary and Overtime parameters row */}
              <div className="grid grid-cols-2 gap-3" id="modal-emp-compensation">
                <div className="space-y-1">
                  <label htmlFor="input-emp-salary" className="text-xs font-bold text-slate-500 block">Base Salary (₹)</label>
                  <input
                    id="input-emp-salary"
                    type="number"
                    required
                    placeholder="e.g. 8450"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-emp-overtime" className="text-xs font-bold text-slate-400 block">Overtime Rate (₹/hr)</label>
                  <input
                    id="input-emp-overtime"
                    type="number"
                    required
                    placeholder="e.g. 70"
                    value={newOvertimeRate}
                    onChange={(e) => setNewOvertimeRate(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="input-emp-deductions" className="text-xs font-bold text-slate-400 block">Standard Deductions (₹)</label>
                <input
                  id="input-emp-deductions"
                  type="number"
                  required
                  placeholder="e.g. 1100"
                  value={newDeductions}
                  onChange={(e) => setNewDeductions(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-3 py-2 bg-slate-50 transition font-mono"
                />
              </div>

              {/* Action options buttons */}
              <div className="flex items-center justify-end gap-3 pt-2" id="modal-emp-buttons">
                <button
                  type="button"
                  id="modal-emp-cancel"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="modal-emp-submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Onboard Associate
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
