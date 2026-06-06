/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, AttendanceRecord, PayrollBatch, SystemSettings, PayoutLog } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '10042',
    name: 'Jane Doe',
    initials: 'JD',
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
    name: 'Marcus Smith',
    initials: 'MS',
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
    name: 'Laura Hales',
    initials: 'LH',
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
    name: 'Tim Wu',
    initials: 'TW',
    avatarColor: 'bg-indigo-100 text-indigo-700',
    baseSalary: 7800.00,
    overtimeHours: 0.00,
    overtimeRate: 65.00,
    deductionRate: 1100.00,
    department: 'Engineering',
    role: 'Backend Developer',
    status: 'Active',
  },
  {
    id: '10072',
    name: 'Sarah Connor',
    initials: 'SC',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    baseSalary: 9100.00,
    overtimeHours: 4.00,
    overtimeRate: 75.00, // 300.00
    deductionRate: 1450.00,
    department: 'Engineering',
    role: 'DevOps Lead',
    status: 'Active',
  },
  {
    id: '10078',
    name: 'Alex Johnson',
    initials: 'AJ',
    avatarColor: 'bg-pink-100 text-pink-700',
    baseSalary: 5800.00,
    overtimeHours: 2.50,
    overtimeRate: 48.00, // 120.00
    deductionRate: 850.00,
    department: 'Design',
    role: 'UI Designer',
    status: 'Active',
  },
  {
    id: '10085',
    name: 'Emily Watson',
    initials: 'EW',
    avatarColor: 'bg-purple-100 text-purple-700',
    baseSalary: 11100.00,
    overtimeHours: 8.00,
    overtimeRate: 95.00, // 760.00
    deductionRate: 2150.00,
    department: 'Product',
    role: 'Product Director',
    status: 'Active',
  },
  {
    id: '10091',
    name: 'Nikhil Raj',
    initials: 'NR',
    avatarColor: 'bg-cyan-100 text-cyan-700',
    baseSalary: 7200.00,
    overtimeHours: 0.00,
    overtimeRate: 60.00,
    deductionRate: 1050.00,
    department: 'Engineering',
    role: 'Frontend Architect',
    status: 'Active',
  },
  {
    id: '10099',
    name: 'Chloe Benoit',
    initials: 'CB',
    avatarColor: 'bg-yellow-105 text-yellow-800',
    baseSalary: 8303.00,
    overtimeHours: 1.00,
    overtimeRate: 72.00,
    deductionRate: 1210.00,
    department: 'Marketing',
    role: 'Specialist',
    status: 'Inactive',
  }
];

export const INITIAL_BATCH: PayrollBatch = {
  id: 'batch_oct_2023_01',
  name: 'Engineering October Run',
  period: 'Oct 2023 Period',
  status: 'Calculate Deductions',
  totalEmployees: 142, // Representing the target size of the screenshot
  grossAmount: 1142400.00,
  deductionsAmount: 312250.00,
  overtimeAmount: 12450.00,
  netAmount: 842600.00,
  createdAt: '2023-10-20T08:00:00Z',
  isCompleted: false,
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_01',
    employeeId: '10042',
    employeeName: 'Jane Doe',
    date: '2023-10-24',
    clockIn: '08:45 AM',
    clockOut: '05:15 PM',
    totalHours: 8.5,
    status: 'On Time',
  },
  {
    id: 'att_02',
    employeeId: '10045',
    employeeName: 'Marcus Smith',
    date: '2023-10-24',
    clockIn: '09:12 AM',
    clockOut: '05:00 PM',
    totalHours: 7.8,
    status: 'Late',
  },
  {
    id: 'att_03',
    employeeId: '10051',
    employeeName: 'Laura Hales',
    date: '2023-10-24',
    clockIn: '08:30 AM',
    clockOut: '07:30 PM',
    totalHours: 11.0,
    status: 'On Time',
  },
  {
    id: 'att_04',
    employeeId: '10064',
    employeeName: 'Tim Wu',
    date: '2023-10-24',
    clockIn: '08:55 AM',
    clockOut: '05:10 PM',
    totalHours: 8.25,
    status: 'On Time',
  },
  {
    id: 'att_05',
    employeeId: '10072',
    employeeName: 'Sarah Connor',
    date: '2023-10-24',
    clockIn: '08:15 AM',
    clockOut: '05:45 PM',
    totalHours: 9.5,
    status: 'On Time',
  },
  {
    id: 'att_06',
    employeeId: '10078',
    employeeName: 'Alex Johnson',
    date: '2023-10-24',
    clockIn: '09:35 AM',
    clockOut: '05:05 PM',
    totalHours: 7.5,
    status: 'Late',
  }
];

export const INITIAL_PAYOUTS: PayoutLog[] = [
  {
    id: 'tx_9921',
    batchId: 'batch_sep_2023_01',
    batchName: 'Engineering September Run',
    period: 'Sep 2023 Period',
    amount: 821400.00,
    authorizedBy: 'Alex Thompson',
    authorizedAt: '2023-09-24T14:35:00Z',
    referenceNumber: 'SVB-883921-X',
    bankName: 'Silicon Valley Bank',
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
  authorizedOfficerName: 'Alex Thompson',
  authorizedOfficerRole: 'ADMINISTRATOR',
  lastSyncTime: '2026-06-06T10:33:49Z'
};
