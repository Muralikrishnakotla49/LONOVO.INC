/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, AttendanceRecord, PayrollBatch, SystemSettings, PayoutLog } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '10042',
    name: 'Spiderman',
    initials: 'SM',
    avatarColor: 'bg-blue-100 text-blue-700',
    baseSalary: 8450.00,
    overtimeHours: 6.00,
    overtimeRate: 70.00, // 6 * 70 = 420.00
    deductionRate: 1240.00,
    department: 'Engineering',
    role: 'Senior Software Engineer',
    status: 'Active',
  },
  {
    id: '10045',
    name: 'Ironman',
    initials: 'IM',
    avatarColor: 'bg-orange-100 text-orange-700',
    baseSalary: 6200.00,
    overtimeHours: 0.00,
    overtimeRate: 50.00,
    deductionRate: 980.00,
    department: 'Engineering',
    role: 'QA Engineer',
    status: 'Active',
  },
  {
    id: '10051',
    name: 'Batman',
    initials: 'BM',
    avatarColor: 'bg-slate-100 text-slate-700',
    baseSalary: 12000.00,
    overtimeHours: 11.5,
    overtimeRate: 100.00, // 11.5 * 100 = 1150.00
    deductionRate: 2400.00,
    department: 'Engineering',
    role: 'Principal Architect',
    status: 'Active',
  },
  {
    id: '10064',
    name: 'Deadpool',
    initials: 'DP',
    avatarColor: 'bg-indigo-100 text-indigo-700',
    baseSalary: 7800.00,
    overtimeHours: 0.00,
    overtimeRate: 65.00,
    deductionRate: 1100.00,
    department: 'Engineering',
    role: 'Backend Developer',
    status: 'Active',
  }
];

export const INITIAL_BATCH: PayrollBatch = {
  id: 'batch_oct_2023_01',
  name: 'Engineering October Run',
  period: 'Oct 2023 Period',
  status: 'Calculate Deductions',
  totalEmployees: 4, 
  grossAmount: 34450.00, // 8450 + 6200 + 12000 + 7800
  deductionsAmount: 5720.00, // 1240 + 980 + 2400 + 1100
  overtimeAmount: 1570.00, // 6*70 + 0 + 11.5*100 + 0 = 420 + 1150 = 1570
  netAmount: 30300.00, // gross + overtime - deductions = 34450 + 1570 - 5720 = 30300
  createdAt: '2023-10-20T08:00:00Z',
  isCompleted: false,
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_01',
    employeeId: '10042',
    employeeName: 'Spiderman',
    date: '2023-10-24',
    clockIn: '08:45 AM',
    clockOut: '05:15 PM',
    totalHours: 8.5,
    status: 'On Time',
  },
  {
    id: 'att_02',
    employeeId: '10045',
    employeeName: 'Ironman',
    date: '2023-10-24',
    clockIn: '09:12 AM',
    clockOut: '05:00 PM',
    totalHours: 7.8,
    status: 'Late',
  },
  {
    id: 'att_03',
    employeeId: '10051',
    employeeName: 'Batman',
    date: '2023-10-24',
    clockIn: '08:30 AM',
    clockOut: '07:30 PM',
    totalHours: 11.0,
    status: 'On Time',
  },
  {
    id: 'att_04',
    employeeId: '10064',
    employeeName: 'Deadpool',
    date: '2023-10-24',
    clockIn: '08:55 AM',
    clockOut: '05:10 PM',
    totalHours: 8.25,
    status: 'On Time',
  }
];

export const INITIAL_PAYOUTS: PayoutLog[] = [
  {
    id: 'tx_9921',
    batchId: 'batch_sep_2023_01',
    batchName: 'Engineering September Run',
    period: 'Sep 2023 Period',
    amount: 821400.00,
    authorizedBy: 'Aditya Trivedi',
    authorizedAt: '2023-09-24T14:35:00Z',
    referenceNumber: 'SBI-883921-X',
    bankName: 'State Bank of India',
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: 'LONOVO.INC',
  currencySymbol: '₹',
  overtimeMultiplier: 1.5,
  taxRatePercent: 12.00,
  healthInsurancePercent: 2.5,
  pensionPercent: 3.5,
  svbBankConnected: true,
  authorizedOfficerName: 'Aditya Trivedi',
  authorizedOfficerRole: 'ADMINISTRATOR',
  lastSyncTime: '2026-06-06T10:33:49Z'
};
