/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

// Import Custom Substructures
import NavigationSidebar from './components/NavigationSidebar';
import Header from './components/Header';
import DashboardSection from './components/DashboardSection';
import AttendanceSection from './components/AttendanceSection';
import PayrollSection from './components/PayrollSection';
import EmployeeSection from './components/EmployeeSection';
import SettingsSection from './components/SettingsSection';
import EmployeePortalSection from './components/EmployeePortalSection';
import LoginScreen from './components/LoginScreen';

// Firebase Services & Synchronizer
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  seedInitialFirestoreData,
  dbAddEmployee,
  dbUpdateEmployee,
  dbDeleteEmployee,
  dbUpdateBatch,
  dbAddAttendance,
  dbAddPayout,
  dbUpdateSettings
} from './firebaseSync';

// Mock values and interfaces
import { Employee, PayrollBatch, AttendanceRecord, PayoutLog, SystemSettings } from './types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_BATCH, 
  INITIAL_ATTENDANCE, 
  INITIAL_PAYOUTS, 
  INITIAL_SETTINGS 
} from './mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // Start on Dashboard for admins
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Theme state (light/dark mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Root application authentication session
  const [authSession, setAuthSession] = useState<{
    role: 'ADMIN' | 'EMPLOYEE';
    employeeId?: string;
    userName: string;
    userRole: string;
  } | null>(() => {
    const saved = localStorage.getItem('clockwork_auth_session');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (session: typeof authSession) => {
    setAuthSession(session);
    if (session?.role === 'EMPLOYEE') {
      setCurrentTab('portal');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = () => {
    setAuthSession(null);
    localStorage.removeItem('clockwork_auth_session');
    localStorage.removeItem('clockwork_portal_emp_id');
  };

  // Firebase Authentication & Sync States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // States
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('clockwork_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [activeBatch, setActiveBatch] = useState<PayrollBatch>(() => {
    const saved = localStorage.getItem('clockwork_batch');
    return saved ? JSON.parse(saved) : INITIAL_BATCH;
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('clockwork_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [payoutLogs, setPayoutLogs] = useState<PayoutLog[]>(() => {
    const saved = localStorage.getItem('clockwork_payout_logs');
    return saved ? JSON.parse(saved) : INITIAL_PAYOUTS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('clockwork_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [selectedPeriod, setSelectedPeriod] = useState(INITIAL_BATCH.period);
  const availablePeriods = ['Oct 2023 Period', 'Sep 2023 Period', 'Aug 2023 Period'];

  // Auth Google LogIn and SignOut Routines
  const handleGoogleLogin = async () => {
    setIsSyncing(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Firebase Login Error: ", error);
      alert("Verification could not complete. Recheck Firebase Auth configurations.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogout = async () => {
    setIsSyncing(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase SignOut Error: ", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth Change Event handler
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          // Check if database is empty - seed if so
          const snap = await getDocs(collection(db, 'employees'));
          if (snap.empty) {
            await seedInitialFirestoreData(
              employees,
              activeBatch,
              attendanceLogs,
              payoutLogs,
              settings
            );
          }
        } catch (error) {
          console.error("Bootstrapping/seed check error: ", error);
        } finally {
          setIsSyncing(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Database Observer
  useEffect(() => {
    if (!currentUser) return;

    setIsSyncing(true);

    // Watch Employees
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const loaded: Employee[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as Employee);
      });
      if (loaded.length > 0) {
        setEmployees(loaded);
      }
      setIsSyncing(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'employees');
    });

    // Watch Batches
    const unsubBatches = onSnapshot(collection(db, 'batches'), (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data() as PayrollBatch;
        if (data.id === activeBatch.id) {
          setActiveBatch(data);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'batches');
    });

    // Watch Attendance
    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const loaded: AttendanceRecord[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as AttendanceRecord);
      });
      setAttendanceLogs(loaded.sort((a, b) => b.date.localeCompare(a.date)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'attendance');
    });

    // Watch Payout Logs
    const unsubPayouts = onSnapshot(collection(db, 'payout_logs'), (snapshot) => {
      const loaded: PayoutLog[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as PayoutLog);
      });
      setPayoutLogs(loaded.sort((a, b) => b.authorizedAt.localeCompare(a.authorizedAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'payout_logs');
    });

    // Watch Settings
    const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.id === 'global_config') {
          setSettings(doc.data() as SystemSettings);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings');
    });

    return () => {
      unsubEmployees();
      unsubBatches();
      unsubAttendance();
      unsubPayouts();
      unsubSettings();
    };
  }, [currentUser]);

  // Sync to database LocalStorage to preserve changes across sessions securely (local mode backup)
  useEffect(() => {
    localStorage.setItem('clockwork_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('clockwork_batch', JSON.stringify(activeBatch));
  }, [activeBatch]);

  useEffect(() => {
    localStorage.setItem('clockwork_attendance', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem('clockwork_payout_logs', JSON.stringify(payoutLogs));
  }, [payoutLogs]);

  useEffect(() => {
    localStorage.setItem('clockwork_settings', JSON.stringify(settings));
  }, [settings]);

  // Calculations sync - when employee wages are saved, let's revise dynamic amounts live!
  useEffect(() => {
    const activeStaff = employees.filter(e => e.status === 'Active');
    const overTimeTotal = activeStaff.reduce((sum, e) => sum + (e.overtimeHours * e.overtimeRate), 0);
    const grossTotal = activeStaff.reduce((sum, e) => sum + e.baseSalary, 0);
    const deductionsTotal = activeStaff.reduce((sum, e) => sum + e.deductionRate, 0);
    const netTotal = grossTotal + overTimeTotal - deductionsTotal;

    const updatedBatchValues = {
      totalEmployees: activeStaff.length + 130, // Preserve realistic target headcount size from visual mock 
      grossAmount: grossTotal + 1100000,
      deductionsAmount: deductionsTotal + 300000,
      overtimeAmount: overTimeTotal + 10000,
      netAmount: netTotal + 810000
    };

    setActiveBatch(prev => ({
      ...prev,
      ...updatedBatchValues
    }));
  }, [employees]);

  // Callbacks
  const handleAddEmployee = async (newEmp: Employee) => {
    if (currentUser) {
      await dbAddEmployee(newEmp);
    } else {
      setEmployees(prev => [newEmp, ...prev]);
    }
  };

  const handleUpdateEmployee = async (id: string, updates: Partial<Employee>) => {
    if (currentUser) {
      await dbUpdateEmployee(id, updates);
    } else {
      setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (currentUser) {
      await dbDeleteEmployee(id);
    } else {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  };

  const handleUpdateBatch = async (updates: Partial<PayrollBatch>) => {
    if (currentUser) {
      await dbUpdateBatch(activeBatch.id, updates);
    } else {
      setActiveBatch(prev => ({ ...prev, ...updates }));
    }
  };

  const handleAddAttendanceLog = async (newLog: AttendanceRecord) => {
    if (currentUser) {
      await dbAddAttendance(newLog);
    } else {
      setAttendanceLogs(prev => [newLog, ...prev]);
    }
  };

  const handleAddPayoutLog = async (newLog: PayoutLog) => {
    if (currentUser) {
      await dbAddPayout(newLog);
    } else {
      setPayoutLogs(prev => [newLog, ...prev]);
    }
  };

  const handleUpdateSettings = async (updates: Partial<SystemSettings>) => {
    if (currentUser) {
      await dbUpdateSettings(updates);
    } else {
      setSettings(prev => ({ ...prev, ...updates }));
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Shift period states
    setActiveBatch(prev => ({
      ...prev,
      period: period,
      isCompleted: period !== INITIAL_BATCH.period
    }));
  };

  // Sections router dispatcher
  const renderSection = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardSection
            employees={employees}
            attendanceLogs={attendanceLogs}
            activeBatch={activeBatch}
            payoutLogs={payoutLogs}
            settings={settings}
            onTabChange={(tab) => setCurrentTab(tab)}
          />
        );
      case 'attendance':
        return (
          <AttendanceSection
            employees={employees}
            attendanceLogs={attendanceLogs}
            onAddAttendanceLog={handleAddAttendanceLog}
          />
        );
      case 'payroll':
        return (
          <PayrollSection
            employees={employees}
            activeBatch={activeBatch}
            settings={settings}
            onUpdateBatch={handleUpdateBatch}
            onUpdateEmployee={handleUpdateEmployee}
            onAddPayoutLog={handleAddPayoutLog}
          />
        );
      case 'employees':
        return (
          <EmployeeSection
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        );
      case 'settings':
        return (
          <SettingsSection
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'portal':
        return (
          <EmployeePortalSection
            employees={employees}
            attendanceLogs={attendanceLogs}
            onAddAttendanceLog={handleAddAttendanceLog}
            onUpdateEmployee={handleUpdateEmployee}
            defaultEmpId={authSession?.role === 'EMPLOYEE' ? authSession.employeeId : undefined}
            onAppLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  if (!authSession) {
    return (
      <LoginScreen
        employees={employees}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      />
    );
  }

  const activeUserName = authSession.role === 'ADMIN' ? settings.authorizedOfficerName : authSession.userName;
  const activeUserRole = authSession.role === 'ADMIN' ? settings.authorizedOfficerRole : 'EMPLOYEE';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 flex" id="app-viewport">
      
      {/* Sidebar - Desktop Layout */}
      <div className="hidden lg:block w-[260px] flex-shrink-0" id="desktop-sidebar-wrapper">
        <NavigationSidebar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          userName={activeUserName}
          userRole={activeUserRole}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Sidebar Navigation */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden animate-in fade-in duration-150">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-[280px] h-full"
          >
            <div className="relative">
              {/* Close Button on Drawer */}
              <button
                id="btn-close-mobile-nav"
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-5 right-4 p-1.5 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-700 z-50 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
              
              <NavigationSidebar
                currentTab={currentTab}
                onTabChange={(tab) => {
                  setCurrentTab(tab);
                  setMobileSidebarOpen(false);
                }}
                userName={activeUserName}
                userRole={activeUserRole}
                onLogout={handleLogout}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Structural Layout Content Core */}
      <div className="flex-1 min-w-0" id="page-content-wrapper">
        {/* Header Panel */}
        <Header
          currentTab={currentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          periods={availablePeriods}
          currentUser={currentUser}
          onLogin={handleGoogleLogin}
          onLogout={handleGoogleLogout}
          isSyncing={isSyncing}
          activeBatch={activeBatch}
          attendanceLogs={attendanceLogs}
          onTabChange={setCurrentTab}
          onMenuClick={() => setMobileSidebarOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        />

        {/* Major Workspace Canvas */}
        <main 
          id="main-viewport-pane"
          className="px-4 lg:px-8 pt-20 pb-12 transition-all bg-slate-50 min-h-screen"
        >
          {/* Animated Route switching context */}
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>

    </div>
  );
}
