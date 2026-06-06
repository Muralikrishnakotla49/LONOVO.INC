/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  DocumentData,
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Employee, PayrollBatch, AttendanceRecord, PayoutLog, SystemSettings } from './types';

// Standardized collection paths
const PATH_EMPLOYEES = 'employees';
const PATH_BATCHES = 'batches';
const PATH_ATTENDANCE = 'attendance';
const PATH_PAYOUT_LOGS = 'payout_logs';
const PATH_SETTINGS = 'settings';

/**
 * Uploads initial dataset to Firestore to seed a fresh database
 */
export async function seedInitialFirestoreData(
  employees: Employee[],
  batch: PayrollBatch,
  attendance: AttendanceRecord[],
  payouts: PayoutLog[],
  settings: SystemSettings
) {
  try {
    const b = writeBatch(db);

    // Seed employees
    for (const emp of employees) {
      const ref = doc(db, PATH_EMPLOYEES, emp.id);
      b.set(ref, emp);
    }

    // Seed batch
    const batchRef = doc(db, PATH_BATCHES, batch.id);
    b.set(batchRef, batch);

    // Seed attendance
    for (const att of attendance) {
      const ref = doc(db, PATH_ATTENDANCE, att.id);
      b.set(ref, att);
    }

    // Seed payouts
    for (const pay of payouts) {
      const ref = doc(db, PATH_PAYOUT_LOGS, pay.id);
      b.set(ref, pay);
    }

    // Seed settings (we store global settings under "global_config")
    const settingsRef = doc(db, PATH_SETTINGS, 'global_config');
    b.set(settingsRef, settings);

    await b.commit();
    console.log("Firestore successfully seeded with sandbox payloads!");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed_initial_data');
  }
}

/**
 * CRUD Wrappers for Firestore
 */

// Employee CRUD
export async function dbAddEmployee(emp: Employee) {
  const path = `${PATH_EMPLOYEES}/${emp.id}`;
  try {
    await setDoc(doc(db, PATH_EMPLOYEES, emp.id), emp);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function dbUpdateEmployee(id: string, updates: Partial<Employee>) {
  const path = `${PATH_EMPLOYEES}/${id}`;
  try {
    // Standard setDoc / merger to avoid field overwrite
    await setDoc(doc(db, PATH_EMPLOYEES, id), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function dbDeleteEmployee(id: string) {
  const path = `${PATH_EMPLOYEES}/${id}`;
  try {
    await deleteDoc(doc(db, PATH_EMPLOYEES, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Payroll Batch CRUD
export async function dbAddBatch(batch: PayrollBatch) {
  const path = `${PATH_BATCHES}/${batch.id}`;
  try {
    await setDoc(doc(db, PATH_BATCHES, batch.id), batch);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function dbUpdateBatch(id: string, updates: Partial<PayrollBatch>) {
  const path = `${PATH_BATCHES}/${id}`;
  try {
    await setDoc(doc(db, PATH_BATCHES, id), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Attendance CRUD
export async function dbAddAttendance(rec: AttendanceRecord) {
  const path = `${PATH_ATTENDANCE}/${rec.id}`;
  try {
    await setDoc(doc(db, PATH_ATTENDANCE, rec.id), rec);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Payout Logs CRUD
export async function dbAddPayout(log: PayoutLog) {
  const path = `${PATH_PAYOUT_LOGS}/${log.id}`;
  try {
    await setDoc(doc(db, PATH_PAYOUT_LOGS, log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// System Settings CRUD
export async function dbUpdateSettings(updates: Partial<SystemSettings>) {
  const path = `${PATH_SETTINGS}/global_config`;
  try {
    await setDoc(doc(db, PATH_SETTINGS, 'global_config'), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
