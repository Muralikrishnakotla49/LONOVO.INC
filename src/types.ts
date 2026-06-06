/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number; // hourly rate
  deductionRate: number; // fixed rate or standard percentage deduction
  department: string;
  role: string;
  status: 'Active' | 'Inactive';
  email?: string;
  phone?: string;
  joinDate?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  bankRouting?: string;
  passcode?: string;
}

export interface PayrollBatch {
  id: string;
  name: string;
  period: string; // e.g. "Oct 2023 Period"
  status: 'Review Hours' | 'Calculate Deductions' | 'Finalize Payout';
  totalEmployees: number;
  grossAmount: number;
  deductionsAmount: number;
  overtimeAmount: number;
  netAmount: number;
  createdAt: string;
  authorizedBy?: string;
  authorizedAt?: string;
  isCompleted: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM AM/PM
  clockOut: string; // HH:MM AM/PM
  totalHours: number;
  status: 'On Time' | 'Late' | 'Absent' | 'Half Day';
}

export interface PayoutLog {
  id: string;
  batchId: string;
  batchName: string;
  period: string;
  amount: number;
  authorizedBy: string;
  authorizedAt: string;
  referenceNumber: string;
  bankName: string;
}

export interface SystemSettings {
  companyName: string;
  currencySymbol: string;
  overtimeMultiplier: number;
  taxRatePercent: number;
  healthInsurancePercent: number;
  pensionPercent: number;
  svbBankConnected: boolean;
  authorizedOfficerName: string;
  authorizedOfficerRole: string;
  lastSyncTime: string;
}
