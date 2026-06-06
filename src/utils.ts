/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee } from './types';

/**
 * Formats a number as a standard currency string (e.g., $1,142,400.00)
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  const formatted = absoluteAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Calculates current metrics for an employee
 */
export function calculateEmployeePayroll(employee: Employee) {
  const base = employee.baseSalary;
  const overtime = employee.overtimeHours * employee.overtimeRate;
  const deductions = employee.deductionRate;
  const net = base + overtime - deductions;
  return {
    base,
    overtime,
    deductions,
    net,
  };
}

/**
 * Generates a unique reference transaction code for SVB payout logs
 */
export function generateReferenceNumber(): string {
  const randomSuffix = Math.floor(100000 + Math.random() * 90000).toString();
  return `SVB-${randomSuffix}-X`;
}

/**
 * Formats standard ISO strings to a neat readable datetime in IST
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}
