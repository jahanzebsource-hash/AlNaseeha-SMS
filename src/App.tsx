/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Calendar,
  CalendarCheck, 
  CreditCard, 
  GraduationCap, 
  Bell, 
  Settings,
  Menu,
  X,
  LogOut,
  Search,
  Plus,
  Filter,
  Printer,
  DollarSign,
  MessageCircle,
  Trophy,
  Star,
  FileText,
  TrendingDown,
  TrendingUp,
  Receipt,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  ShoppingCart,
  Package,
  History,
  Archive,
  Calculator,
  RefreshCw,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  PlusCircle,
  ExternalLink,
  PieChart,
  UserPlus2,
  Edit3,
  Layout,
  Send,
  ShieldCheck,
  BellPlus,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  Activity,
  AlertCircle,
  Boxes,
  UserPlus,
  Settings2,
  Coffee,
  ArrowUpLeft,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Student, 
  Teacher, 
  PayrollRecord, 
  Attendance, 
  FeeRecord, 
  FeeChallan, 
  FinanceTransaction, 
  TransactionType, 
  IncomeCategory, 
  ExpenseCategory,
  InventoryItem,
  InventoryInvoice,
  InvoiceItem,
  Vendor,
  VendorPayment,
  TimetableSlot,
  TimetableEntry,
  UserProfile,
  UserRole
} from './types';
import { authService } from './services/authService';
import { smartDB } from './services/smartDB';

type View = 'dashboard' | 'students' | 'teachers' | 'attendance' | 'fees' | 'exams' | 'announcements' | 'finance' | 'cashbook' | 'inventory' | 'timetable' | 'session' | 'balancesheet';

const SCHOOL_CLASSES = [
  'Play Group', 'Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'
];

const SESSION_SEQUENCE: Record<string, string> = {
  'Play Group': 'Nursery',
  'Nursery': 'KG',
  'KG': '1st',
  '1st': '2nd',
  '2nd': '3rd',
  '3rd': '4th',
  '4th': '5th',
  '5th': '6th',
  '6th': '7th',
  '7th': '8th',
  '8th': '9th',
  '9th': '10th',
  '10th': 'Alumnus'
};

const SCHOOL_LOGO = "https://i.postimg.cc/hJNQDRvB/alnaseeha-logo.png"; // User provided link
const SCHOOL_NAME = "Al-Naseeha High School";
const SCHOOL_ADDRESS = "Main Mir nabi Bux town road, paretabad Hyderabad";
const SCHOOL_PHONE = "0311-3281707";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [activeView, setActiveView] = useState<View>('dashboard');
  
  // Sync view with URL query parameters for "Open in New Tab" support
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as View;
    if (viewParam && ['dashboard', 'students', 'teachers', 'attendance', 'fees', 'exams', 'announcements', 'finance', 'cashbook', 'inventory', 'timetable', 'session', 'balancesheet'].includes(viewParam)) {
      setActiveView(viewParam);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentView = (currentParams.get('view') || 'dashboard') as View;
      setActiveView(currentView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetView = (view: View) => {
    setActiveView(view);
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState({}, '', url);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [feeChallans, setFeeChallans] = useState<FeeChallan[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<InventoryInvoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);

  const onDeleteStudent = async (id: string) => {
    if (confirm('Are you sure you want to delete this student? All records will be removed.')) {
      await smartDB.deleteRecord('students', id);
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [currentSession, setCurrentSession] = useState<string>('2023-24');

  // Load Settings from DB
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.openingBalance) setOpeningBalance(Number(data.openingBalance));
        if (data.currentSession) setCurrentSession(data.currentSession);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: any) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch (err) {
      console.error("Failed to save setting:", err);
    }
  };

  // Smart Sync Initialization
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          storedStudents, 
          storedTeachers, 
          storedTransactions, 
          storedAttendance, 
          storedFees, 
          storedInventory,
          storedPayroll
        ] = await Promise.all([
          smartDB.getAllRecords('students'),
          smartDB.getAllRecords('teachers'),
          smartDB.getAllRecords('transactions'),
          smartDB.getAllRecords('attendance'),
          smartDB.getAllRecords('fees'),
          smartDB.getAllRecords('inventory'),
          smartDB.getAllRecords('payroll')
        ]);

        if (storedStudents.length > 0) setStudents(storedStudents);
        if (storedTeachers.length > 0) setTeachers(storedTeachers);
        if (storedTransactions.length > 0) setTransactions(storedTransactions);
        if (storedAttendance.length > 0) setAttendance(storedAttendance);
        if (storedFees.length > 0) setFeeRecords(storedFees);
        if (storedInventory.length > 0) setInventory(storedInventory);
        if (storedPayroll.length > 0) setPayroll(storedPayroll);
      } catch (err) {
        console.error("Critical: Failed to load initial data from server:", err);
      }
    };
    loadInitialData();
  }, []);

  // Auto-sync effects to ensure persistence
  useEffect(() => {
    if (students.length > 0) {
      students.forEach(s => smartDB.saveRecord('students', s));
    }
  }, [students]);

  useEffect(() => {
    if (teachers.length > 0) {
      teachers.forEach(t => smartDB.saveRecord('teachers', t));
    }
  }, [teachers]);

  useEffect(() => {
    if (feeRecords.length > 0) {
      feeRecords.forEach(f => smartDB.saveRecord('fees', f));
    }
  }, [feeRecords]);

  useEffect(() => {
    if (transactions.length > 0) {
      transactions.forEach(t => smartDB.saveRecord('transactions', t));
    }
  }, [transactions]);

  useEffect(() => {
    if (inventory.length > 0) {
      inventory.forEach(i => smartDB.saveRecord('inventory', i));
    }
  }, [inventory]);

  useEffect(() => {
    if (attendance.length > 0) {
      attendance.forEach(a => smartDB.saveRecord('attendance', a));
    }
  }, [attendance]);

  const totalMonthlyFee = useMemo(() => {
    return students.reduce((sum, student) => sum + (Number(student.monthlyFee) || 0), 0);
  }, [students]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'principal', 'teacher', 'accountant'], category: 'Main' },
    { id: 'students', label: 'Student Management', icon: Users, roles: ['admin', 'principal', 'accountant'], category: 'Academics' },
    { id: 'teachers', label: 'Staff & Teachers', icon: UserSquare2, roles: ['admin', 'principal', 'accountant'], category: 'Academics' },
    { id: 'attendance', label: 'Attendance System', icon: CalendarCheck, roles: ['admin', 'principal', 'teacher', 'accountant'], category: 'Academics' },
    { id: 'timetable', label: 'Time Table', icon: BookOpen, roles: ['admin', 'principal', 'teacher', 'student'], category: 'Academics' },
    { id: 'session', label: 'Session & Promo', icon: RefreshCw, roles: ['admin', 'principal'], category: 'Academics' },
    { id: 'exams', label: 'Examinations', icon: GraduationCap, roles: ['admin', 'principal', 'teacher', 'accountant'], category: 'Academics' },
    { id: 'fees', label: 'Fee & Financials', icon: CreditCard, roles: ['admin', 'principal', 'accountant'], category: 'Finance' },
    { id: 'finance', label: 'Income & Expense', icon: Receipt, roles: ['admin', 'principal', 'accountant'], category: 'Finance' },
    { id: 'cashbook', label: 'Daily Cashbook', icon: Calculator, roles: ['admin', 'principal', 'accountant'], category: 'Finance' },
    { id: 'balancesheet', label: 'Balance Sheet', icon: BarChart3, roles: ['admin', 'principal', 'accountant'], category: 'Finance' },
    { id: 'inventory', label: 'Inventory & Sale', icon: Package, roles: ['admin', 'principal', 'accountant'], category: 'Resources' },
    { id: 'announcements', label: 'Announcements', icon: Bell, roles: ['all'], category: 'Resources' },
  ];

  const categories = ['Main', 'Academics', 'Finance', 'Resources'];

  const filteredNavItems = navItems.filter(item => 
    !user || item.roles.includes('all') || item.roles.includes(user.role)
  );

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const renderView = () => {
    if (user?.role === 'student') {
      const studentData = students.find(s => s.email === user.email);
      if (!studentData) return <div className="p-8 text-center">No student record found for your account.</div>;
      return <StudentDashboardView student={studentData} />;
    }

    const displayStudents = user?.role === 'teacher' && user.assignedClass 
      ? students.filter(s => s.grade === user.assignedClass)
      : students;

    switch (activeView) {
    case 'dashboard':
        return (
          <DashboardView 
            totalMonthlyFee={totalMonthlyFee} 
            recentStudents={students.slice(-4).reverse()} 
            totalTeachers={teachers.length}
            setActiveView={handleSetView} 
            user={user} 
          />
        );
      case 'students':
        return <StudentsView students={displayStudents} onAddStudent={(s) => setStudents(prev => prev.some(item => item.id === s.id) ? prev.map(item => item.id === s.id ? s : item) : [...prev, s])} onDeleteStudent={onDeleteStudent} />;
      case 'teachers':
        return (
          <TeachersView 
            teachers={teachers} 
            payroll={payroll}
            onAddTeacher={(t) => setTeachers(prev => prev.some(item => item.id === t.id) ? prev.map(item => item.id === t.id ? t : item) : [...prev, t])}
            onGeneratePayroll={(p) => setPayroll([...payroll, p])}
          />
        );
      case 'attendance':
        return (
          <AttendanceView 
            students={displayStudents} 
            attendance={attendance}
            onMarkAttendance={(sId, status) => {
              const today = new Date().toISOString().split('T')[0];
              setAttendance(prev => {
                const existing = prev.find(a => a.studentId === sId && a.date === today);
                if (existing) {
                  return prev.map(a => a.id === existing.id ? { ...a, status } : a);
                }
                return [...prev, {
                  id: Math.random().toString(36).substr(2, 9),
                  studentId: sId,
                  status,
                  date: today,
                  markedBy: user?.name || 'Admin'
                }];
              });
            }}
          />
        );
      case 'fees':
        return (
          <FeesView 
            students={students} 
            feeRecords={feeRecords} 
            feeChallans={feeChallans}
            session={currentSession}
            onRecordFee={(record) => setFeeRecords(prev => [...prev, record])}
            onSaveChallans={(newChallans) => setFeeChallans(prev => [...prev, ...newChallans])}
            onDeleteChallan={(id) => setFeeChallans(prev => prev.filter(c => c.id !== id))}
            onUpdateChallan={(challan) => setFeeChallans(prev => prev.map(c => c.id === challan.id ? challan : c))}
          />
        );
      case 'finance':
        return (
          <FinanceView 
            students={students} 
            transactions={transactions}
            onAddTransaction={(t) => setTransactions(prev => [...prev, t])}
            onDeleteTransaction={(id) => setTransactions(prev => prev.filter(tr => tr.id !== id))}
          />
        );
      case 'cashbook':
        return (
          <CashbookView 
            transactions={transactions}
            invoices={invoices}
          />
        );
      case 'inventory':
        return (
          <InventoryView 
            students={students}
            inventory={inventory}
            invoices={invoices}
            vendors={vendors}
            vendorPayments={vendorPayments}
            onAddVendorPayment={(p) => setVendorPayments(prev => [...prev, p])}
            onAddInvoice={(invoice) => {
              setInvoices(prev => [...prev, invoice]);
              // Update stock when sale or purchase
              setInventory(prev => prev.map(item => {
                const invoiceItems = invoice.items.filter(ii => ii.inventoryItemId === item.id);
                if (invoiceItems.length > 0) {
                  const totalQty = invoiceItems.reduce((s, i) => s + i.quantity, 0);
                  return {
                    ...item,
                    stockQuantity: invoice.type === 'purchase' 
                      ? item.stockQuantity + totalQty 
                      : item.stockQuantity - totalQty
                  };
                }
                return item;
              }));
              // Record income/expense in finance transactions
              // Only record the AMOUNT PAID as actual cash flow
              if (invoice.amountPaid > 0) {
                const newTrans: FinanceTransaction = {
                  id: Math.random().toString(36).substr(2, 9),
                  type: invoice.type === 'purchase' ? 'expense' : 'income',
                  category: 'Stationery Sale', // Simplified
                  amount: invoice.amountPaid,
                  date: invoice.date,
                  description: `${invoice.type === 'purchase' ? 'Purchase' : 'Sale'} Receipt: ${invoice.id}`,
                  month: invoice.month,
                  year: invoice.year,
                  studentId: invoice.studentId
                };
                setTransactions(prev => [...prev, newTrans]);
              }
            }}
            onUpdateInvoice={(invoice, paymentReceived) => {
              setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
              if (paymentReceived && paymentReceived > 0) {
                const newTrans: FinanceTransaction = {
                  id: Math.random().toString(36).substr(2, 9),
                  type: invoice.type === 'purchase' ? 'expense' : 'income',
                  category: 'Stationery Sale',
                  amount: paymentReceived,
                  date: new Date().toISOString().split('T')[0],
                  description: `Remaining Payment for ${invoice.type === 'purchase' ? 'Purchase' : 'Sale'} ${invoice.id}`,
                  month: new Date().toLocaleString('default', { month: 'long' }),
                  year: new Date().getFullYear(),
                  studentId: invoice.studentId
                };
                setTransactions(prev => [...prev, newTrans]);
              }
            }}
            onDeleteInvoice={(id) => setInvoices(prev => prev.filter(inv => inv.id !== id))}
            onUpdateVendor={(vendor) => setVendors(prev => prev.map(v => v.id === vendor.id ? vendor : v))}
            onAddVendor={(vendor) => setVendors(prev => [...prev, vendor])}
          />
        );
      case 'timetable':
        return (
          <TimetableView 
            teachers={teachers}
            slots={timetableSlots}
            entries={timetableEntries}
            onUpdateSlots={setTimetableSlots}
            onUpdateEntries={setTimetableEntries}
          />
        );
      case 'exams':
        return <ExamsView students={displayStudents} />;
      case 'session':
        return (
          <SessionManagementView 
            students={students} 
            session={currentSession}
            onPromote={(promoted) => {
              setStudents(promoted);
              // Save to smartDB
              promoted.forEach(s => smartDB.saveRecord('students', s));
            }}
            onUpdateSession={(s) => {
              setCurrentSession(s);
              saveSetting('currentSession', s);
            }}
          />
        );
      case 'balancesheet':
        return (
          <BalanceSheetView 
            transactions={transactions} 
            openingBalance={openingBalance}
            onUpdateOpeningBalance={(bal) => {
              setOpeningBalance(bal);
              saveSetting('openingBalance', bal);
            }}
          />
        );
      case 'announcements':
        return <AnnouncementsView />;
      default:
        return (
          <DashboardView 
            totalMonthlyFee={totalMonthlyFee} 
            recentStudents={students.slice(-4).reverse()} 
            totalTeachers={teachers.length}
            setActiveView={handleSetView} 
            user={user} 
          />
        );
    }
  };

  if (!user) {
    return <LoginView onLogin={(user) => setUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`sidebar-gradient text-slate-400 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${
          isSidebarOpen ? 'w-[280px]' : 'w-20'
        } fixed inset-y-0 left-0 z-50 border-r border-white/5 no-print shadow-2xl`}
      >
        <div className="p-8 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shrink-0 flex items-center justify-center p-1.5 shadow-xl shadow-white/5 overflow-hidden group hover:rotate-3 transition-transform cursor-pointer">
                  <img 
                    src={SCHOOL_LOGO} 
                    alt="Logo" 
                    className="w-full h-full object-contain" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2913/2913008.png';
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-sm font-black tracking-tight text-white leading-none mb-1 uppercase">
                    Al-Naseeha
                  </h1>
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Principal Dashboard</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          <nav className="space-y-8 px-4 pb-10">
            {categories.map((category) => {
              const categoryItems = filteredNavItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category} className="space-y-2">
                  {isSidebarOpen && (
                    <div className="px-4 mb-3">
                       <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-2">
                         <span className="w-1 h-3 bg-accent/50 rounded-full" />
                         {category}
                       </h2>
                    </div>
                  )}
                  <div className="space-y-1">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative group"
                      >
                        <button
                          onClick={() => handleSetView(item.id as View)}
                          className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                            activeView === item.id 
                              ? 'text-white font-bold' 
                              : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                          }`}
                        >
                          {activeView === item.id && (
                            <motion.div 
                              layoutId="activeNav"
                              className="absolute inset-0 bg-accent shadow-lg shadow-accent/25"
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <div className="relative z-10 flex items-center w-full">
                            <item.icon size={20} className={`shrink-0 transition-transform group-hover:scale-110 ${activeView === item.id ? 'text-white' : 'text-inherit'}`} />
                            {isSidebarOpen && (
                              <motion.span 
                                initial={false}
                                animate={{ opacity: 1, x: 0 }}
                                className="ml-4 text-sm tracking-tight flex-1 text-left whitespace-nowrap"
                              >
                                {item.label}
                              </motion.span>
                            )}
                            
                            {isSidebarOpen && (
                              <a
                                href={`?view=${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg transition-all ml-1 ${activeView === item.id ? 'text-white' : 'text-slate-500'}`}
                                title="Open in new tab"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="ml-4 text-sm font-bold tracking-tight">Logout System</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarOpen ? 'ml-[280px]' : 'ml-20'}`}>
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-10 flex items-center justify-between sticky top-0 z-40 no-print shadow-sm shadow-slate-100">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={18} />
            <Input 
              placeholder="Search directory..." 
              className="pl-12 w-[340px] bg-slate-50 border-transparent text-sm h-11 focus:border-accent/20 focus:bg-white transition-all rounded-2xl placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-slate-200 pr-6 no-print">
               <div className="flex flex-col items-end">
                 <Badge variant="secondary" className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-2 bg-emerald-50 text-emerald-600 border-emerald-100">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   System Connected
                 </Badge>
               </div>
               <Popover>
                <PopoverTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-[10px] font-black text-slate-500 hover:text-accent uppercase tracking-[0.2em] gap-3 px-3 rounded-xl transition-all")}>
                  <UserSquare2 size={16} /> Switch Role
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 bg-white border-slate-200 shadow-2xl rounded-3xl mt-2 animate-in fade-in zoom-in duration-200">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase px-3 py-2 tracking-widest border-b border-slate-100 mb-2">Account Selector</p>
                    {/* Demo accounts removed */}
                    {[].map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          authService.login(u.email, '123');
                          setUser(authService.getCurrentUser());
                          handleSetView('dashboard');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-foreground hover:bg-accent/5 hover:text-accent rounded-lg transition-colors flex items-center justify-between"
                      >
                        {u.name}
                        <Badge variant="outline" className="text-[8px] uppercase px-1 h-4">{u.role}</Badge>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-foreground">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground uppercase">{user?.role} | Session: {currentSession}</div>
            </div>
            
            <Popover>
              <PopoverTrigger className="h-8 w-8 bg-accent text-white font-bold text-xs cursor-pointer hover:opacity-80 transition-opacity rounded-full border-none p-0 overflow-hidden">
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-accent text-white border-none">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-white border-border shadow-2xl rounded-xl">
                <div className="space-y-1">
                  <div className="px-3 py-2 border-bottom border-border mb-1">
                    <p className="text-xs font-black text-foreground truncate">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  
                  {user?.role === 'principal' && (
                    <button
                      onClick={() => smartDB.exportFullBackup()}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Archive size={14} /> Backup Database (JSON)
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} /> Logout Account
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardView({ totalMonthlyFee, recentStudents, totalTeachers, setActiveView, user }: { totalMonthlyFee: number, recentStudents: Student[], totalTeachers: number, setActiveView: (v: View) => void, user: UserProfile | null }) {
  const stats = [
    { label: 'Total Students', value: recentStudents.length.toString(), delta: '+24 this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Teachers', value: totalTeachers.toString(), delta: '3% Staff Strength', icon: UserSquare2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Monthly Income', value: `Rs. ${totalMonthlyFee.toLocaleString()}`, delta: 'Total Fee Demand', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50', private: true },
    { label: 'Daily Attendance', value: '94.2%', delta: 'Trending upwards', icon: CalendarCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const filteredStats = user?.role === 'teacher' ? stats.filter(s => !s.private) : stats;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm h-full rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{stat.value}</h3>
                <p className={`text-[10px] font-bold ${stat.color} uppercase tracking-tight`}>{stat.delta}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-slate-50">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">Recent Admissions</CardTitle>
            </div>
            <Button variant="link" onClick={() => setActiveView('students')} className="text-blue-600 font-bold text-xs uppercase tracking-widest">View All Students</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest">Student Name</th>
                    <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest">Roll No</th>
                    <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest">Class</th>
                    <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-center">Fee</th>
                    <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentStudents.map((student, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-4 font-bold text-slate-700">{student.name}</td>
                      <td className="px-8 py-4 text-slate-500 font-mono text-xs">#{student.rollNumber}</td>
                      <td className="px-8 py-4 text-slate-500 font-medium">{student.grade}</td>
                      <td className="px-8 py-4 text-center text-slate-500">Rs. {student.monthlyFee.toLocaleString()}</td>
                      <td className="px-8 py-4 text-right">
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase tracking-widest">Active</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-xl font-black text-slate-900">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { time: '08:30 AM', task: 'Morning Assembly', loc: 'Main Ground • All Grades' },
                { time: '10:00 AM', task: 'Staff Meeting', loc: 'Conference Hall A' },
                { time: '12:45 PM', task: 'Board Exam Briefing', loc: 'Auditorium • Grade 10-12' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="bg-slate-100 text-slate-500 px-3 py-2 rounded-lg font-bold text-[10px] min-w-20 text-center">{item.time}</div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{item.task}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.loc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-slate-900 text-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black tracking-tight">Quick Action</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <Button onClick={() => setActiveView('students')} variant="secondary" className="h-12 bg-white/10 hover:bg-white/20 border-none text-white text-[10px] font-bold uppercase tracking-widest rounded-xl">Add Student</Button>
                 <Button onClick={() => setActiveView('fees')} variant="secondary" className="h-12 bg-white/10 hover:bg-white/20 border-none text-white text-[10px] font-bold uppercase tracking-widest rounded-xl">Pay Fees</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StudentsView({ students, onAddStudent, onDeleteStudent }: { students: Student[], onAddStudent: (s: Student) => void, onDeleteStudent: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesClass = filterClass === 'all' || s.grade === filterClass;
      const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.rollNumber || '').includes(searchQuery) ||
                          (s.parentName || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [students, filterClass, searchQuery]);

  const uniqueClasses = SCHOOL_CLASSES;

  const handlePrint = () => {
    window.print();
  };

  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    parentContact: '',
    dateOfBirth: '',
    monthlyFee: '',
    grade: '',
    section: '',
    rollNumber: '',
    arrears: '',
    arrearsDescription: '',
    isActive: true
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingStudent(null);
      setFormData({ name: '', parentName: '', parentContact: '', dateOfBirth: '', monthlyFee: '', grade: '', section: '', rollNumber: '', arrears: '', arrearsDescription: '', isActive: true });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      parentName: student.parentName,
      parentContact: student.parentContact,
      dateOfBirth: student.dateOfBirth,
      monthlyFee: (Number(student.monthlyFee) || 0).toString(),
      grade: student.grade,
      section: student.section,
      rollNumber: student.rollNumber,
      arrears: (Number(student.arrears) || 0).toString(),
      arrearsDescription: student.arrearsDescription || '',
      isActive: student.isActive !== false
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedStudent: Student = {
      id: editingStudent ? editingStudent.id : Math.random().toString(36).substr(2, 9),
      email: `${formData.name.toLowerCase().replace(/\s/g, '')}@school.com`,
      role: 'student',
      name: formData.name,
      parentName: formData.parentName,
      parentContact: formData.parentContact,
      dateOfBirth: formData.dateOfBirth,
      monthlyFee: Number(formData.monthlyFee),
      grade: formData.grade,
      section: formData.section,
      rollNumber: formData.rollNumber,
      arrears: Number(formData.arrears) || 0,
      arrearsDescription: formData.arrearsDescription,
      isActive: formData.isActive,
      address: editingStudent?.address || '',
      createdAt: editingStudent?.createdAt || new Date().toISOString(),
    };
    onAddStudent(updatedStudent);
    handleOpenChange(false);
  };

  const toggleStatus = (student: Student) => {
    const updated = { ...student, isActive: !student.isActive };
    onAddStudent(updated);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Student Directory</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Academic Records • Archive Phase IV</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handlePrint} 
            className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm active:scale-95"
          >
            <Printer size={18} className="mr-3 opacity-60" /> Export List
          </Button>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white h-14 px-10 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-accent/25 transition-all hover:scale-105 active:scale-95">
                <PlusCircle size={20} className="mr-3" /> New Enrollment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-0 overflow-hidden border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
              <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <DialogTitle className="text-3xl font-black tracking-tight mb-2">{editingStudent ? 'Update Profile' : 'Student Enrollment'}</DialogTitle>
                  <DialogDescription className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Portal Entry Verification Required</DialogDescription>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-[80px] -mr-24 -mt-24" />
              </div>
              <form onSubmit={handleSubmit} className="p-10 bg-white space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Student Full Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-accent/20 transition-all font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Father Name</Label>
                    <Input value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-accent/20 transition-all font-bold" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Primary Contact</Label>
                    <Input value={formData.parentContact} onChange={(e) => setFormData({...formData, parentContact: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-accent/20 transition-all font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Monthly Tuition</Label>
                    <Input type="number" value={formData.monthlyFee} onChange={(e) => setFormData({...formData, monthlyFee: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-accent/20 transition-all font-bold" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Academic Grade</Label>
                    <Select value={formData.grade} onValueChange={(val) => setFormData({...formData, grade: val})}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent transition-all font-bold">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {uniqueClasses.map(c => <SelectItem key={c} value={c} className="rounded-xl">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Section</Label>
                    <Input value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-transparent transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Roll ID</Label>
                    <Input value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-transparent transition-all font-bold" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-16 bg-accent font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-accent/20 text-xs">
                  {editingStudent ? 'Synchronize Record' : 'Activate Admission'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="no-print grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={20} />
          <Input 
            placeholder="Search students by name, roll number, or parentage..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-16 rounded-[1.5rem] border-none shadow-sm shadow-slate-200/50 bg-white text-base font-medium focus:ring-accent/10 placeholder:text-slate-400"
          />
        </div>
        <div className="md:col-span-4">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="h-16 rounded-[1.5rem] border-none shadow-sm shadow-slate-200/50 bg-white font-black text-slate-600 px-6">
              <div className="flex items-center gap-3">
                <Filter size={18} className="opacity-50" />
                <span className="uppercase tracking-widest text-[11px] mb-0.5">Filter Class</span>
              </div>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="all" className="rounded-xl font-bold">All Divisions</SelectItem>
              {uniqueClasses.map(c => <SelectItem key={c} value={c} className="rounded-xl font-bold">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Identify Profile</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Division</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Financial Status</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Archive size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records matching your search queries</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-accent group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm border border-slate-200/50">
                            {row.name.charAt(0)}
                          </div>
                          {row.isActive !== false && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm shadow-emerald-500/20" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1.5">{row.name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">S/O {row.parentName}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <code className="text-[10px] font-black text-accent uppercase tracking-widest">ID {row.rollNumber}</code>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <Badge className="bg-indigo-50 text-indigo-600 border-none px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
                        Grade {row.grade}
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-slate-900 text-base">PKR {row.monthlyFee.toLocaleString()}</span>
                        {row.arrears > 0 ? (
                          <Badge className="bg-rose-50 text-rose-500 border-none px-3 py-1 rounded-full text-[9px] font-black mt-2 uppercase tracking-tight">
                            Outstanding: {row.arrears.toLocaleString()}
                          </Badge>
                        ) : (
                          <span className="text-[9px] text-emerald-500 font-black mt-2 uppercase tracking-widest opacity-60">Settled Account</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} className="h-12 w-12 rounded-2xl text-slate-400 hover:text-accent hover:bg-accent/5 hover:scale-110 active:scale-95 transition-all">
                          <Edit size={20} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteStudent(row.id)} className="h-12 w-12 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all">
                          <Trash2 size={20} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
function TeachersView({ 
  teachers, 
  payroll, 
  onAddTeacher, 
  onGeneratePayroll 
}: { 
  teachers: Teacher[], 
  payroll: PayrollRecord[],
  onAddTeacher: (t: Teacher) => void,
  onGeneratePayroll: (p: PayrollRecord) => void
}) {
  const [view, setView] = useState<'staff' | 'payroll'>('staff');
  const [openPayroll, setOpenPayroll] = useState(false);
  const [openAddStaff, setOpenAddStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Teacher | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    designation: '',
    employeeId: '',
    contactNumber: '',
    baseSalary: '',
    qualification: '',
    assignedClass: '',
    loginId: '',
    password: '',
    role: 'teacher' as UserRole,
    isTeaching: true
  });
  
  const [payrollForm, setPayrollForm] = useState({
    bonus: '0',
    deductions: '0',
    month: 'May',
  });

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const newStaffPayload = {
      name: staffForm.name,
      designation: staffForm.designation,
      employeeId: staffForm.employeeId,
      contactNumber: staffForm.contactNumber,
      baseSalary: Number(staffForm.baseSalary),
      qualification: staffForm.qualification,
      assignedClass: staffForm.assignedClass === 'none' ? undefined : staffForm.assignedClass,
      loginId: staffForm.loginId,
      password: staffForm.password,
      role: staffForm.role,
      isTeaching: staffForm.isTeaching,
      email: `${staffForm.name.toLowerCase().replace(/\s/g, '')}@school.com`,
    };

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffPayload),
      });
      if (response.ok) {
        const savedStaff = await response.json();
        onAddTeacher(savedStaff);
        setOpenAddStaff(false);
        setStaffForm({ 
          name: '', designation: '', employeeId: '', contactNumber: '', 
          baseSalary: '', qualification: '', assignedClass: '', 
          loginId: '', password: '', role: 'teacher', isTeaching: true 
        });
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Failed to save staff: ${errData.error || "Please check if details (Login ID, Employee ID) are unique."}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error saving staff member: ${err.message}`);
    }
  };

  const handleEditStaffRequest = (teacher: Teacher) => {
    setSelectedStaff(teacher);
    setStaffForm({
      name: teacher.name,
      designation: teacher.designation,
      employeeId: teacher.employeeId,
      contactNumber: teacher.contactNumber || '',
      baseSalary: teacher.baseSalary.toString(),
      qualification: teacher.qualification,
      assignedClass: teacher.assignedClass || 'none',
      loginId: teacher.loginId || '',
      password: '',
      role: teacher.role,
      isTeaching: teacher.isTeaching !== false
    });
    setOpenAddStaff(true);
  };

  const handleEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    const updatedStaffPayload = {
      id: selectedStaff.id,
      name: staffForm.name,
      designation: staffForm.designation,
      employeeId: staffForm.employeeId,
      contactNumber: staffForm.contactNumber,
      baseSalary: Number(staffForm.baseSalary),
      qualification: staffForm.qualification,
      assignedClass: staffForm.assignedClass === 'none' ? undefined : staffForm.assignedClass,
      loginId: staffForm.loginId,
      password: staffForm.password || undefined,
      role: staffForm.role,
      isTeaching: staffForm.isTeaching,
      email: selectedStaff.email
    };
    
    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStaffPayload),
      });
      if (response.ok) {
        const savedStaff = await response.json();
        onAddTeacher(savedStaff); 
        setOpenAddStaff(false);
        setSelectedStaff(null);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Failed to update staff: ${errData.error || "Please check if details are unique."}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error updating staff member: ${err.message}`);
    }
  };

  const handleGeneratePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    const bonus = Number(payrollForm.bonus);
    const deductions = Number(payrollForm.deductions);
    const netSalary = selectedStaff.baseSalary + bonus - deductions;

    const newRecord: PayrollRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: selectedStaff.employeeId,
      month: payrollForm.month,
      year: new Date().getFullYear(),
      baseSalary: selectedStaff.baseSalary,
      bonus,
      deductions,
      netSalary,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
    };

    onGeneratePayroll(newRecord);
    setOpenPayroll(false);
  };

  const handlePrintSalarySlips = (employeeId?: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const relevantPayroll = employeeId 
      ? payroll.filter(p => p.employeeId === employeeId)
      : payroll;

    const slipsHtml = relevantPayroll.map(p => {
      const staff = teachers.find(t => t.employeeId === p.employeeId);
      return `
        <div class="salary-slip">
          <div style="display:flex; align-items:center; gap:15px; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
             <div style="width:60px; height:60px; display:flex; align-items:center; justify-content:center;">
                <img src="${SCHOOL_LOGO}" alt="Logo" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2913/2913008.png'">
             </div>
             <div style="text-align:center; flex:1; margin-right:60px;">
                <h2 style="margin:0; font-size:18px; color:#1e293b; text-transform:uppercase;">Al-Naseeha High School</h2>
                <p style="margin:5px 0; font-size:12px; font-weight:bold; color:#3b82f6;">Salary Slip - ${p.month} ${p.year}</p>
             </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:12px;">
            <div><strong>Staff Name:</strong> ${staff?.name}</div>
            <div><strong>Employee ID:</strong> ${p.employeeId}</div>
            <div><strong>Designation:</strong> ${staff?.designation}</div>
            <div><strong>Payment Date:</strong> ${p.paymentDate}</div>
          </div>
          <div style="margin-top:20px; border:1px solid #ccc;">
            <div style="display:grid; grid-template-columns: 2fr 1fr; border-bottom:1px solid #ccc; background:#f9f9f9; padding:5px; font-weight:bold;">
              <span>Earnings</span><span>Amount</span>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr; border-bottom:1px solid #eee; padding:5px;">
              <span>Base Salary</span><span>Rs.${p.baseSalary}</span>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr; border-bottom:1px solid #eee; padding:5px;">
              <span>Bonus</span><span>Rs.${p.bonus}</span>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr; background:#f9f9f9; padding:5px; font-weight:bold;">
              <span>Deductions</span><span>-Rs.${p.deductions}</span>
            </div>
          </div>
          <div style="margin-top:15px; text-align:right; font-size:16px; font-weight:bold; color:#1e293b;">
            Net Salary: Rs.${p.netSalary}
          </div>
          <div style="margin-top:30px; display:flex; justify-content:space-between; font-size:10px;">
            <div style="border-top:1px solid #000; padding-top:5px; width:120px; text-align:center;">Employee Signature</div>
            <div style="border-top:1px solid #000; padding-top:5px; width:120px; text-align:center;">Authorized Signature</div>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Slips</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .salary-slip { border: 1px dashed #666; padding: 20px; margin-bottom: 20px; height: 320px; page-break-inside: avoid; }
            @media print { .salary-slip { border: 1px dashed #000; } }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${slipsHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Administrative Core</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">H.R. Management • Financial Operations</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-[1.2rem]">
          <Button 
            onClick={() => setView('staff')} 
            variant="ghost" 
            className={cn(
              "h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
              view === 'staff' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Faculty Directory
          </Button>
          <Button 
            onClick={() => setView('payroll')} 
            variant="ghost" 
            className={cn(
              "h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
              view === 'payroll' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Payroll Ledger
          </Button>
        </div>
      </div>

      {view === 'staff' ? (
        <div className="space-y-8">
          <div className="flex justify-end no-print">
            <Button 
              onClick={() => {
                setSelectedStaff(null);
                setStaffForm({ name: '', designation: '', employeeId: '', contactNumber: '', baseSalary: '', qualification: '', assignedClass: '', loginId: '', password: '', role: 'teacher', isTeaching: true });
                setOpenAddStaff(true);
              }} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-10 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-600/25"
            >
              <UserPlus2 size={20} className="mr-3" /> New Appointment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm border border-slate-100">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="flex bg-slate-50 rounded-xl p-1 no-print">
                        <Button variant="ghost" size="icon" onClick={() => handleEditStaffRequest(teacher)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm">
                          <Edit3 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedStaff(teacher); setOpenPayroll(true); }} className="h-9 w-9 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white shadow-sm">
                          <Wallet size={16} />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{teacher.name}</h3>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6">{teacher.designation}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Emp ID</p>
                          <p className="text-xs font-bold text-slate-700">#{teacher.employeeId}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary</p>
                          <p className="text-xs font-bold text-slate-700">PKR {teacher.baseSalary.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="opacity-50" />
                          {teacher.qualification}
                        </div>
                        <div className="flex items-center gap-2">
                          <Layout size={14} className="opacity-50" />
                          Grade {teacher.assignedClass || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Employee Detail</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Billing Month</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Net Amount</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Payment Status</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Verification Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {payroll.map((p) => {
                  const staffMember = teachers.find(t => t.employeeId === p.employeeId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                            {staffMember?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base mb-0.5">{staffMember?.name || p.employeeId}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staffMember?.designation || 'Staff Member'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="font-bold text-slate-600 italic">Month of {p.month}, {p.year % 100}</span>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <p className="font-black text-slate-900 text-lg">PKR {p.netSalary.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gross {p.baseSalary.toLocaleString()}</p>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <Badge className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                          Disbursed
                        </Badge>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 text-slate-400 group-hover:text-slate-900 transition-colors">
                          <Calendar size={14} className="opacity-50" />
                          <span className="text-[11px] font-bold tracking-widest uppercase">{new Date(p.paymentDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payroll Dialog */}
      <Dialog open={openPayroll} onOpenChange={setOpenPayroll}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-emerald-950 p-10 text-white">
            <DialogTitle className="text-3xl font-black tracking-tight mb-2">Issue Salary</DialogTitle>
            <DialogDescription className="font-bold text-emerald-300/60 uppercase tracking-widest text-[10px]">Financial Disbursement Authorization</DialogDescription>
          </div>
          <form onSubmit={handleGeneratePayroll} className="p-10 space-y-8 bg-white">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Beneficiary</p>
              <h4 className="text-xl font-black text-slate-900 leading-none">{selectedStaff?.name}</h4>
              <p className="text-xs font-bold text-indigo-600 mt-2">Base Salary: PKR {selectedStaff?.baseSalary.toLocaleString()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Bonus/Inc.</Label>
                <Input type="number" value={payrollForm.bonus} onChange={(e) => setPayrollForm({...payrollForm, bonus: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-emerald-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Deductions</Label>
                <Input type="number" value={payrollForm.deductions} onChange={(e) => setPayrollForm({...payrollForm, deductions: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-rose-500" />
              </div>
            </div>

            <Button type="submit" className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/20">
              Disburse Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={openAddStaff} onOpenChange={setOpenAddStaff}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-indigo-950 p-10 text-white">
            <DialogTitle className="text-3xl font-black tracking-tight mb-2">
              {selectedStaff ? 'Update Appointment' : 'New Appointment'}
            </DialogTitle>
            <DialogDescription className="font-bold text-indigo-300/60 uppercase tracking-widest text-[10px]">H.R. Information Systems Portal</DialogDescription>
          </div>
          <form onSubmit={selectedStaff ? handleEditStaffSubmit : handleAddStaff} className="p-10 space-y-8 bg-white max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Full Name</Label>
                <Input value={staffForm.name} onChange={(e) => setStaffForm({...staffForm, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Designation</Label>
                <Input value={staffForm.designation} onChange={(e) => setStaffForm({...staffForm, designation: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Employee ID</Label>
                <Input value={staffForm.employeeId} onChange={(e) => setStaffForm({...staffForm, employeeId: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Contact #</Label>
                <Input value={staffForm.contactNumber} onChange={(e) => setStaffForm({...staffForm, contactNumber: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Base Salary</Label>
                <Input type="number" value={staffForm.baseSalary} onChange={(e) => setStaffForm({...staffForm, baseSalary: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Qualification</Label>
                <Input value={staffForm.qualification} onChange={(e) => setStaffForm({...staffForm, qualification: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Assigned Grade</Label>
                <Select value={staffForm.assignedClass} onValueChange={(val) => setStaffForm({...staffForm, assignedClass: val})}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Principal/No Class</SelectItem>
                    {SCHOOL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">System Role</Label>
                <Select value={staffForm.role} onValueChange={(val: any) => setStaffForm({...staffForm, role: val})}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="clerk">Office Associate</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Login Username</Label>
                <Input value={staffForm.loginId} onChange={(e) => setStaffForm({...staffForm, loginId: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">{selectedStaff ? 'Reset Password' : 'Login Password'}</Label>
                <Input type="password" value={staffForm.password} onChange={(e) => setStaffForm({...staffForm, password: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" required={!selectedStaff} />
              </div>
            </div>

            <Button type="submit" className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20">
              {selectedStaff ? 'Save Record' : 'Authorize Appointment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AttendanceView({ 
  students, 
  attendance, 
  onMarkAttendance 
}: { 
  students: Student[], 
  attendance: Attendance[],
  onMarkAttendance: (sId: string, status: Attendance['status']) => void 
}) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // WhatsApp Link Helper
  const getWhatsAppLink = (student: Student, status: string) => {
    const phone = student.parentContact || '923000000000'; // Fallback
    const message = `Dear Parent, your child ${student.name} is ${status.toUpperCase()} today (${selectedDate}) at Al-Naseeha School.`;
    return `https://wa.me/${phone.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
  };

  // Star of the Month calculation
  const starStudents = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return students.filter(student => {
      const monthAttendance = attendance.filter(a => {
        const d = new Date(a.date);
        return a.studentId === student.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      
      // Must have at least one record this month and NO negative records
      if (monthAttendance.length === 0) return false;
      return !monthAttendance.some(a => a.status === 'absent' || a.status === 'late' || a.status === 'leave');
    });
  }, [students, attendance]);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Attendance Terminal</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Institutional Registry & Parent Notifications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Session Date</Label>
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 w-44 rounded-xl border-none font-bold bg-white shadow-sm" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <div className="p-10 border-b border-slate-100 bg-slate-50/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Scholar Registry</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Roll Call Protocol v2024.1</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Verified Data
                </Badge>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Scholar Profile</th>
                    <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Status Matrix</th>
                    <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Parent Notification</th>
                    <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {students.map((student) => {
                    const att = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-base leading-none mb-1">{student.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Roll: {student.rollNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex justify-center gap-2">
                            {[
                              { label: 'P', val: 'present', color: 'emerald' },
                              { label: 'A', val: 'absent', color: 'rose' },
                              { label: 'L', val: 'late', color: 'amber' },
                              { label: 'V', val: 'leave', color: 'indigo' }
                            ].map((s) => (
                              <button
                                key={s.val}
                                onClick={() => onMarkAttendance(student.id, s.val as Attendance['status'])}
                                className={cn(
                                  "w-10 h-10 rounded-xl font-black text-xs transition-all border-2 active:scale-90",
                                  att?.status === s.val 
                                    ? `bg-${s.color}-600 border-${s.color}-600 text-white shadow-lg shadow-${s.color}-600/25`
                                    : "border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                                )}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center">
                          {(att?.status === 'absent' || att?.status === 'late') ? (
                            <a 
                              href={getWhatsAppLink(student, att.status)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2.5 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm hover:shadow-emerald-600/20 active:scale-95"
                            >
                              <MessageCircle size={14} className="opacity-80" /> Notify Parent
                            </a>
                          ) : (
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                              <ShieldCheck size={14} className="opacity-30" /> Record Secure
                            </span>
                          )}
                        </td>
                        <td className="px-10 py-8 text-right">
                          <Input placeholder="Add internal note..." className="h-10 text-[10px] font-bold border-none bg-slate-50 group-hover:bg-white transition-colors rounded-xl text-right max-w-[150px] inline-block shadow-inner" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl shadow-indigo-600/10 rounded-[2.5rem] bg-indigo-950 text-white overflow-hidden relative min-h-[600px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="p-8 border-b border-white/5 relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                <Trophy size={24} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-none mb-1">Prime Vanguard</h3>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Monthly Perfect Logs</p>
              </div>
            </div>
            <ScrollArea className="h-full max-h-[500px] p-6 relative z-10">
              {starStudents.length > 0 ? (
                <div className="space-y-4">
                  {starStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-indigo-500/50 shadow-xl shadow-black/50">
                            <AvatarFallback className="bg-indigo-800 text-indigo-300 font-black text-xs">{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full h-5 w-5 flex items-center justify-center border-2 border-indigo-950">
                            <Star size={10} className="text-white" fill="currentColor" />
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-white text-sm leading-none mb-1">{student.name}</p>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{student.grade}-{student.section}</p>
                        </div>
                      </div>
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-none px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter">Elite</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-10 space-y-4 opacity-40">
                  <Star size={40} className="text-indigo-400" strokeWidth={1} />
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-relaxed">No scholars have achieved perfect session integrity this period.</p>
                </div>
              )}
            </ScrollArea>
          </Card>
          
          <div className="grid grid-cols-2 gap-6 no-print">
            {[
              { label: 'Present', value: attendance.filter(a => a.date === selectedDate && a.status === 'present').length, color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 },
              { label: 'Absent', value: attendance.filter(a => a.date === selectedDate && a.status === 'absent').length, color: 'text-rose-500', bg: 'bg-rose-50', icon: X },
              { label: 'Late', value: attendance.filter(a => a.date === selectedDate && a.status === 'late').length, color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
              { label: 'Leave', value: attendance.filter(a => a.date === selectedDate && a.status === 'leave').length, color: 'text-indigo-500', bg: 'bg-indigo-50', icon: CalendarCheck },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm shadow-slate-200/50 rounded-3xl p-6 bg-white group hover:shadow-xl transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6", stat.bg, stat.color)}>
                    <stat.icon size={18} />
                  </div>
                  <Badge variant="outline" className="border-slate-100 text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">RT-Data</Badge>
                </div>
                <h3 className={cn("text-2xl font-black tracking-tight leading-none mb-1", stat.color)}>{stat.value}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-emerald-600 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-emerald-600/20 group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck size={20} className="text-emerald-200" />
                 <h4 className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Internal Protocol</h4>
              </div>
              <p className="text-sm font-bold leading-relaxed opacity-90 italic">"Registry accuracy is the bedrock of institutional data integrity. Every mark matters."</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function FeesView({ 
  students, 
  feeRecords, 
  feeChallans, 
  session,
  onRecordFee,
  onSaveChallans,
  onDeleteChallan,
  onUpdateChallan
}: { 
  students: Student[], 
  feeRecords: FeeRecord[], 
  feeChallans: FeeChallan[],
  session: string,
  onRecordFee: (r: FeeRecord) => void,
  onSaveChallans: (c: FeeChallan[]) => void,
  onDeleteChallan: (id: string) => void,
  onUpdateChallan: (as: FeeChallan) => void
}) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(null);
  const [openRecord, setOpenRecord] = useState(false);
  const [openLedger, setOpenLedger] = useState(false);
  const [openChallanDetail, setOpenChallanDetail] = useState(false);
  const [openChallanEdit, setOpenChallanEdit] = useState(false);
  const [openManualChallan, setOpenManualChallan] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'challans'>('all');
  const [challanSearch, setChallanSearch] = useState('');
  
  const [feeForm, setFeeForm] = useState({
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
  });

  const [manualChallanForm, setManualChallanForm] = useState({
    studentId: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    tuitionFee: 0,
    transportFee: 0,
    examFee: 0,
    arrears: 0,
    arrearsDescription: '',
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0]
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const studentLedger = useMemo(() => {
    if (!selectedStudent) return [];
    return feeRecords
      .filter(r => r.studentId === selectedStudent.id)
      .sort((a, b) => {
        const dateA = new Date(`${a.month} 1, ${a.year}`);
        const dateB = new Date(`${b.month} 1, ${b.year}`);
        return dateB.getTime() - dateA.getTime();
      });
  }, [selectedStudent, feeRecords]);

  const pendingStudents = useMemo(() => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    return students.filter(s => {
      if (s.isActive === false) return false;
      const isPaid = feeRecords.some(r => 
        r.studentId === s.id && 
        r.month === currentMonth && 
        r.year === currentYear && 
        r.status === 'paid'
      );
      return !isPaid;
    });
  }, [students, feeRecords]);

  const totalPending = useMemo(() => {
    return pendingStudents.reduce((sum, s) => sum + (Number(s.monthlyFee) || 0) + (Number(s.arrears) || 0), 0);
  }, [pendingStudents]);

  const generateIndividualChallan = (student: Student) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0];

    const total = (Number(student.monthlyFee) || 0) + (Number(student.arrears) || 0);
    const newChallan: FeeChallan = {
      id: `CH-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      studentId: student.id,
      month: currentMonth,
      year: currentYear,
      issueDate,
      dueDate,
      monthlyFee: (Number(student.monthlyFee) || 0),
      arrears: (Number(student.arrears) || 0),
      totalPayable: total,
      status: 'issued'
    };
    onSaveChallans([newChallan]);
    alert(`Challan generated for ${student.name}`);
  };

  const handleManualChallanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualChallanForm.studentId) {
      alert("Please select a student.");
      return;
    }

    const total = Number(manualChallanForm.tuitionFee) + 
                  Number(manualChallanForm.transportFee) + 
                  Number(manualChallanForm.examFee) + 
                  Number(manualChallanForm.arrears);

    const newChallan: FeeChallan = {
      id: `CH-IND-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      studentId: manualChallanForm.studentId,
      month: manualChallanForm.month,
      year: manualChallanForm.year,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: manualChallanForm.dueDate,
      monthlyFee: Number(manualChallanForm.tuitionFee),
      arrears: Number(manualChallanForm.arrears) + Number(manualChallanForm.transportFee) + Number(manualChallanForm.examFee),
      arrearsDescription: `${manualChallanForm.arrearsDescription ? manualChallanForm.arrearsDescription + ' ' : ''}(Exam: ${manualChallanForm.examFee}, Transport: ${manualChallanForm.transportFee})`,
      totalPayable: total,
      status: 'issued'
    };

    onSaveChallans([newChallan]);
    setOpenManualChallan(false);
    alert("Individual challan generated successfully.");
  };

  const handleRecordFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const newRecord: FeeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: selectedStudent.id,
      amount: Number(feeForm.amount),
      month: feeForm.month,
      year: Number(feeForm.year),
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
    };

    onRecordFee(newRecord);
    setOpenRecord(false);
    
    // Generate WhatsApp Link in Urdu
    const message = `اسلام علیکم! آپ کے بچے ${selectedStudent.name} کی فیس مبلغ ${feeForm.amount} روپے برائے مہینہ ${feeForm.month} وصول کر لی گئی ہے۔ شکریہ۔`;
    const waLink = `https://wa.me/${selectedStudent.parentContact.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  const generateBulkChallansAction = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0];

    const newChallans: FeeChallan[] = students.map(s => {
      const total = s.monthlyFee + (s.arrears || 0);
      return {
        id: `CH-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        studentId: s.id,
        month: currentMonth,
        year: currentYear,
        monthlyFee: s.monthlyFee,
        arrears: s.arrears || 0,
        arrearsDescription: s.arrearsDescription,
        totalPayable: total,
        issueDate,
        dueDate,
        status: 'issued'
      };
    });

    onSaveChallans(newChallans);
    setActiveTab('challans');
  };

  const generateChallanHtmlMarkup = (challan: Partial<FeeChallan> & { studentName: string; grade: string; rollNumber: string }, title: string) => {
    return `
      <div style="width: 48%; border: 2px solid #000; padding: 15px; box-sizing: border-box; position: relative; background: #fff;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <img src="${SCHOOL_LOGO}" style="width: 50px; height: 50px;" referrerpolicy="no-referrer" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2913/2913008.png'">
            <div style="text-align: left;">
              <h2 style="margin: 0; font-size: 14px; text-transform: uppercase; font-weight: 900;">${SCHOOL_NAME}</h2>
              <p style="margin: 0; font-size: 9px; font-weight: bold; color: #666;">${SCHOOL_ADDRESS}</p>
            </div>
          </div>
          <p style="margin: 2px 0; font-size: 9px; font-weight: bold; color: #666;">Contact: ${SCHOOL_PHONE} | Session: ${session}</p>
          <div style="background: #000; color: #fff; display: inline-block; padding: 2px 10px; font-size: 10px; margin-top: 5px; font-weight: bold; border-radius: 2px;">
            ${title}
          </div>
        </div>
        
        <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
          <tr><td style="padding: 3px 0; width: 35%;"><strong>Challan ID:</strong></td><td style="border-bottom: 1px dashed #000;">${challan.id || 'N/A'}</td></tr>
          <tr><td style="padding: 3px 0;"><strong>Student Name:</strong></td><td style="border-bottom: 1px dashed #000;">${challan.studentName}</td></tr>
          <tr><td style="padding: 3px 0;"><strong>Roll No / Grade:</strong></td><td style="border-bottom: 1px dashed #000;">${challan.rollNumber} / ${challan.grade}</td></tr>
          <tr><td style="padding: 3px 0;"><strong>Fee Month:</strong></td><td style="border-bottom: 1px dashed #000;">${challan.month} ${challan.year}</td></tr>
        </table>

        <table style="width: 100%; margin-top: 12px; font-size: 10px; border: 1px solid #000;">
          <tr style="background: #f0f0f0;"><th style="border: 1px solid #000; padding: 4px; text-align: left;">Description</th><th style="border: 1px solid #000; padding: 4px; text-align: right;">Amount</th></tr>
          <tr><td style="border: 1px solid #000; padding: 4px;">Tuition Fee</td><td style="border: 1px solid #000; padding: 4px; text-align: right;">Rs. ${challan.monthlyFee?.toLocaleString()}</td></tr>
          <tr>
            <td style="border: 1px solid #000; padding: 4px;">
              <strong>Arrears / Previous Dues</strong>
              ${challan.arrearsDescription ? `<br><small style="color:#666;">(${challan.arrearsDescription})</small>` : ''}
            </td>
            <td style="border: 1px solid #000; padding: 4px; text-align: right;">Rs. ${challan.arrears?.toLocaleString()}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 11px;"><td style="border: 1px solid #000; padding: 4px; background: #f0f0f0;">Total Payable</td><td style="border: 1px solid #000; padding: 4px; text-align: right; background: #f0f0f0;">Rs. ${challan.totalPayable?.toLocaleString()}</td></tr>
        </table>

        <div style="margin-top: 25px; display: flex; justify-content: space-between; font-size: 9px;">
          <div style="border-top: 1px solid #000; width: 90px; text-align: center; padding-top: 3px;">Bank/Cashier</div>
          <div style="border-top: 1px solid #000; width: 90px; text-align: center; padding-top: 3px;">Parent/Guardian</div>
        </div>
        
        <p style="font-size: 7px; margin-top: 10px; color: #666; font-style: italic;">* Due Date: ${challan.dueDate}. Please pay on time.</p>
        <p style="font-size: 7px; text-align: right; color: #999; margin: 0;">Date: ${challan.issueDate}</p>
      </div>
    `;
  };

  const printChallan = (challan: FeeChallan) => {
    const student = students.find(s => s.id === challan.studentId);
    if (!student) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Challan - ${student.name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; }
            .challan-container { display: flex; justify-content: space-between; width: 100%; }
            @media print { .challan-container { page-break-after: always; } }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="challan-container">
            ${generateChallanHtmlMarkup({ ...challan, studentName: student.name, grade: student.grade, rollNumber: student.rollNumber }, 'School Copy')}
            <div style="border-left: 1px dashed #666; margin: 0 5px;"></div>
            ${generateChallanHtmlMarkup({ ...challan, studentName: student.name, grade: student.grade, rollNumber: student.rollNumber }, 'Student Copy')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printBulkChallans = (challansToPrint: FeeChallan[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const allChallansHtml = challansToPrint.map(challan => {
      const student = students.find(s => s.id === challan.studentId);
      if (!student) return '';
      return `
        <div class="challan-container" style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 30px; page-break-inside: avoid; page-break-after: always; padding-bottom: 20px;">
          ${generateChallanHtmlMarkup({ ...challan, studentName: student.name, grade: student.grade, rollNumber: student.rollNumber }, 'School Copy')}
          <div style="border-left: 1px dashed #666; margin: 0 5px;"></div>
          ${generateChallanHtmlMarkup({ ...challan, studentName: student.name, grade: student.grade, rollNumber: student.rollNumber }, 'Student Copy')}
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk Fee Challans - ${new Date().toLocaleString('default', { month: 'long' })}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 10px; }
            @media print { 
              body { padding: 0; }
              .challan-container { margin-bottom: 0 !important; padding: 20px !important; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${allChallansHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredChallans = useMemo(() => {
    return feeChallans.filter(c => {
      const student = students.find(s => s.id === c.studentId);
      const searchLower = challanSearch.toLowerCase();
      return (
        student?.name.toLowerCase().includes(searchLower) ||
        c.id.toLowerCase().includes(searchLower)
      );
    });
  }, [feeChallans, students, challanSearch]);

  const displayList = activeTab === 'all' ? students : pendingStudents;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Current Month Demand</p>
              <h3 className="text-3xl font-black tracking-tighter leading-none mb-2">Rs. {students.reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0).toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest">Active Tuition Pool</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Outstanding</p>
              <h3 className="text-3xl font-black text-rose-600 tracking-tighter leading-none mb-2">Rs. {totalPending.toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-widest">{pendingStudents.length} Students Pending</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">System Inventory</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{feeChallans.length}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated Challans</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl w-fit">
        <Button onClick={() => setActiveTab('all')} variant="ghost" className={cn("h-10 px-6 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all", activeTab === 'all' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}>All Students</Button>
        <Button onClick={() => setActiveTab('pending')} variant="ghost" className={cn("h-10 px-6 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all", activeTab === 'pending' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}>Pending Dues ({pendingStudents.length})</Button>
        <Button onClick={() => setActiveTab('challans')} variant="ghost" className={cn("h-10 px-6 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all", activeTab === 'challans' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}>Challan Management</Button>
      </div>

      {activeTab !== 'challans' ? (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white no-print">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Student Fee Records</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage monthly fees and dues</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => {
                  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
                  alert(`Defaulter Summary for ${currentMonth}:\n\nTotal Students Unpaid: ${pendingStudents.length}\nTotal Outstanding Amount: Rs. ${totalPending.toLocaleString()}\n(Calculation: Base Fees + Pending Arrears)`);
                }}
                variant="outline" 
                className="h-10 px-4 rounded-xl border-rose-100 text-rose-600 font-bold uppercase tracking-widest text-[9px] hover:bg-rose-50"
              >
                Defaulters Summary
              </Button>
              <Button onClick={() => setOpenManualChallan(true)} variant="outline" className="h-10 px-4 rounded-xl border-blue-100 text-blue-600 font-bold uppercase tracking-widest text-[9px] hover:bg-blue-50">
                <PlusCircle size={14} className="mr-2" /> Generate Individual Challan
              </Button>
              <Button onClick={generateBulkChallansAction} className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-blue-600/20">
                <Printer size={14} className="mr-2" /> Bulk Generate Challans
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest">Student</th>
                  <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest">Roll No</th>
                  <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest">Monthly Fee</th>
                  <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-center">Dues Status</th>
                  <th className="px-8 py-5 font-bold uppercase text-[10px] text-slate-400 tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayList.map((student) => {
                  const currentMonthPaid = feeRecords.find(r => 
                    r.studentId === student.id && 
                    r.month === new Date().toLocaleString('default', { month: 'long' }) &&
                    r.year === new Date().getFullYear()
                  );
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900 leading-none mb-1">{student.name}</p>
                        <p className="text-[10px] font-medium text-slate-400">Grade: {student.grade} - {student.section}</p>
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-mono text-xs">{student.rollNumber}</td>
                      <td className="px-8 py-5 font-bold text-slate-700">Rs. {(Number(student.monthlyFee) || 0).toLocaleString()}</td>
                      <td className="px-8 py-5 text-center">
                        <Badge className={cn("px-4 py-1 rounded-full font-bold text-[9px] uppercase tracking-widest border-none", currentMonthPaid ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500")}>
                          {currentMonthPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => generateIndividualChallan(student)} className="h-8 border-emerald-100 text-emerald-600 hover:bg-emerald-50 text-[9px] font-bold uppercase tracking-widest rounded-lg">
                            <Receipt size={12} className="mr-1.5" /> Challan
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedStudent(student);
                              setFeeForm(prev => ({ ...prev, amount: student.monthlyFee.toString() }));
                              setOpenRecord(true);
                            }}
                            className="h-8 border-blue-100 text-blue-600 hover:bg-blue-50 text-[9px] font-bold uppercase tracking-widest rounded-lg"
                          >
                            Record Fee
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedStudent(student);
                              setOpenLedger(true);
                            }}
                            className="h-8 text-slate-400 hover:text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded-lg"
                          >
                            Ledger
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 bg-slate-50/20">
            <div>
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Issued Challans</CardTitle>
              <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">History of fee challans generated</CardDescription>
            </div>
            <div className="relative w-full md:w-[400px] group">
              <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input 
                placeholder="Search by student name or challan ID..." 
                className="pl-14 h-16 rounded-2xl border-none bg-white shadow-inner font-bold text-base focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                value={challanSearch}
                onChange={(e) => setChallanSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-12 py-8 font-black uppercase text-[10px] text-slate-400 tracking-widest">Artifact ID</th>
                    <th className="px-12 py-8 font-black uppercase text-[10px] text-slate-400 tracking-widest">Entity Info</th>
                    <th className="px-12 py-8 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Temporal Window</th>
                    <th className="px-12 py-8 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Net Value</th>
                    <th className="px-12 py-8 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Status</th>
                    <th className="px-12 py-8 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-medium">
                  {filteredChallans.length > 0 ? filteredChallans.map((challan) => {
                    const student = students.find(s => s.id === challan.studentId);
                    return (
                      <tr key={challan.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                        <td className="px-12 py-10 font-black text-indigo-600 tracking-widest font-mono text-[11px] group-hover:scale-105 transition-transform origin-left">{challan.id}</td>
                        <td className="px-12 py-10">
                          <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none mb-1">{student?.name || 'Unknown Entity'}</div>
                          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Grade {student?.grade}</div>
                        </td>
                        <td className="px-12 py-10 text-center">
                          <p className="font-black text-slate-700 leading-none mb-1">{challan.month} {challan.year}</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Billing Cycle</p>
                        </td>
                        <td className="px-12 py-10 font-black text-slate-900 text-lg text-center tracking-tighter">Rs. {challan.totalPayable.toLocaleString()}</td>
                        <td className="px-12 py-10 text-center">
                          <Badge className={cn(
                            "px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-[0.2em] border-none shadow-sm",
                            challan.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                            challan.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                            'bg-amber-50 text-amber-600'
                          )}>
                            {challan.status}
                          </Badge>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex justify-end gap-3 no-print">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-slate-100 hover:rotate-6 transition-all" 
                              onClick={() => {
                                setSelectedChallan(challan);
                                setOpenChallanDetail(true);
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-amber-600"
                              onClick={() => {
                                setSelectedChallan(challan);
                                setOpenChallanEdit(true);
                              }}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600" onClick={() => printChallan(challan)}>
                              <Printer size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => onDeleteChallan(challan.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="p-10 text-center italic text-muted-foreground">No challans found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Individual Challan Dialog */}
      <Dialog open={openManualChallan} onOpenChange={setOpenManualChallan}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Individual Challan</DialogTitle>
            <DialogDescription>Create a custom fee challan for a specific student</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleManualChallanSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Select Student</Label>
              <Select 
                value={manualChallanForm.studentId} 
                onValueChange={(v) => {
                  const student = students.find(s => s.id === v);
                  setManualChallanForm({
                    ...manualChallanForm, 
                    studentId: v,
                    tuitionFee: student?.monthlyFee || 0,
                    arrears: student?.arrears || 0,
                    arrearsDescription: student?.arrearsDescription || ''
                  });
                }}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select a student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Month</Label>
                <Select value={manualChallanForm.month} onValueChange={(v) => setManualChallanForm({...manualChallanForm, month: v})}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Year</Label>
                <Input type="number" value={manualChallanForm.year} onChange={(e) => setManualChallanForm({...manualChallanForm, year: Number(e.target.value)})} className="h-9 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Tuition Fee</Label>
                <Input type="number" value={manualChallanForm.tuitionFee} onChange={(e) => setManualChallanForm({...manualChallanForm, tuitionFee: Number(e.target.value)})} className="h-9 text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Transport Fee</Label>
                <Input type="number" value={manualChallanForm.transportFee} onChange={(e) => setManualChallanForm({...manualChallanForm, transportFee: Number(e.target.value)})} className="h-9 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Exam Fee</Label>
                <Input type="number" value={manualChallanForm.examFee} onChange={(e) => setManualChallanForm({...manualChallanForm, examFee: Number(e.target.value)})} className="h-9 text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Arrears</Label>
                <Input type="number" value={manualChallanForm.arrears} onChange={(e) => setManualChallanForm({...manualChallanForm, arrears: Number(e.target.value)})} className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={manualChallanForm.dueDate} onChange={(e) => setManualChallanForm({...manualChallanForm, dueDate: e.target.value})} className="h-9 text-xs" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenManualChallan(false)} className="h-9 text-xs">Cancel</Button>
              <Button type="submit" className="bg-accent h-9 text-xs font-bold">Generate & Save Challan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Challan Detail Dialog */}
      <Dialog open={openChallanDetail} onOpenChange={setOpenChallanDetail}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Challan Detail - {selectedChallan?.id}
            </DialogTitle>
            <DialogDescription>Full breakdown of generated fee challan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Student</p>
                <p className="text-sm font-bold">{students.find(s => s.id === selectedChallan?.studentId)?.name}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Period</p>
                <p className="text-sm font-bold">{selectedChallan?.month} {selectedChallan?.year}</p>
              </div>
            </div>
            <div className="border border-border rounded-xl overflow-hidden text-xs">
              <div className="flex justify-between p-3 border-b bg-muted/30">
                <span className="font-bold">Description</span>
                <span className="font-bold">Amount</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between italic">
                  <span>Tuition Fee</span>
                  <span>Rs.{selectedChallan?.monthlyFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between italic">
                  <span>Previous Arrears</span>
                  <span>Rs.{selectedChallan?.arrears.toLocaleString()}</span>
                </div>
                {selectedChallan?.arrearsDescription && (
                  <p className="text-[10px] text-muted-foreground pl-2 italic">({selectedChallan.arrearsDescription})</p>
                )}
              </div>
              <div className="flex justify-between p-3 bg-accent/10 border-t border-accent/20 font-bold text-sm">
                <span>Total Payable</span>
                <span className="text-accent font-black">Rs.{selectedChallan?.totalPayable.toLocaleString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[11px] text-muted-foreground">
              <p>Issue Date: {selectedChallan?.issueDate}</p>
              <p className="text-right">Due Date: {selectedChallan?.dueDate}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenChallanDetail(false)} className="h-9 text-xs">Close</Button>
            <Button onClick={() => selectedChallan && printChallan(selectedChallan)} className="h-9 text-xs bg-primary">
              <Printer size={14} className="mr-2" /> Print Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Challan Edit Dialog */}
      <Dialog open={openChallanEdit} onOpenChange={setOpenChallanEdit}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Challan - {selectedChallan?.id}</DialogTitle>
            <DialogDescription>Modify amount or status for this specific challan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Payable Amount (PKR)</Label>
              <Input 
                type="number" 
                value={selectedChallan?.totalPayable} 
                onChange={(e) => setSelectedChallan(prev => prev ? { ...prev, totalPayable: Number(e.target.value) } : null)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Challan Status</Label>
              <Select 
                value={selectedChallan?.status} 
                onValueChange={(v: any) => setSelectedChallan(prev => prev ? { ...prev, status: v } : null)}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenChallanEdit(false)} className="h-9 text-xs text-red-600 hover:bg-red-50 border-red-100">Cancel</Button>
            <Button onClick={() => {
              if (selectedChallan) {
                onUpdateChallan(selectedChallan);
                setOpenChallanEdit(false);
              }
            }} className="h-9 text-xs bg-accent">Update Challan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Fee Dialog */}
      <Dialog open={openRecord} onOpenChange={setOpenRecord}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Fee Deposit - {selectedStudent?.name}</DialogTitle>
            <DialogDescription>Enter payment details to update student records.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordFee} className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-xs">Amount</Label>
              <Input id="amount" type="number" value={feeForm.amount} onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})} className="col-span-3 h-9 text-xs" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Month</Label>
              <Select value={feeForm.month} onValueChange={(v) => setFeeForm({...feeForm, month: v})}>
                <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Year</Label>
              <Input value={feeForm.year} disabled className="col-span-3 h-9 text-xs bg-muted" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-primary w-full h-10 text-xs font-bold flex items-center gap-2">
                <MessageCircle size={16} /> Submit & Send WhatsApp Msg
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Ledger Dialog */}
      <Dialog open={openLedger} onOpenChange={setOpenLedger}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <div className="flex items-center gap-4">
               <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-white font-black">{selectedStudent?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-black">{selectedStudent?.name}'s Ledger</DialogTitle>
                <DialogDescription className="text-xs">Comprehensive tracking of fee history and payments</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-[10px] font-bold text-primary uppercase text-center mb-1 underline">Basic Info</p>
                  <div className="text-[10px] space-y-1">
                    <p><strong>Monthly:</strong> Rs. {selectedStudent?.monthlyFee.toLocaleString()}</p>
                    <p><strong>Arrears:</strong> Rs. {selectedStudent?.arrears?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Paid Count</p>
                  <p className="text-xl font-black text-emerald-800">{studentLedger.length}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold text-red-700 uppercase">Arrears Dues</p>
                  <p className="text-lg font-black text-red-800">Rs. {selectedStudent?.arrears?.toLocaleString() || '0'}</p>
                </div>
              </div>
              
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Financial records</p>
              <ScrollArea className="h-[300px] border border-border rounded-xl">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-muted/50 font-bold sticky top-0 bg-white">
                    <tr>
                      <th className="p-3 border-b border-border">Type / Month</th>
                      <th className="p-3 border-b border-border">Reference / Date</th>
                      <th className="p-3 border-b border-border text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedStudent?.arrears ? (
                      <tr className="bg-amber-50">
                        <td className="p-3 font-bold text-amber-800 uppercase text-[9px]">Opening Balance (Arrears)</td>
                        <td className="p-3 text-amber-600 text-[9px]">{selectedStudent.arrearsDescription || 'Previous pending fee'}</td>
                        <td className="p-3 text-right font-black text-amber-800">Rs.{selectedStudent.arrears.toLocaleString()}</td>
                      </tr>
                    ) : null}
                    {studentLedger.length > 0 ? studentLedger.map(record => (
                      <tr key={record.id}>
                        <td className="p-3 font-bold">Monthly Fee: {record.month} {record.year}</td>
                        <td className="p-3 text-muted-foreground">{record.paymentDate}</td>
                        <td className="p-3 text-right font-black text-emerald-600">Rs.{record.amount.toLocaleString()}</td>
                      </tr>
                    )) : !selectedStudent?.arrears && (
                      <tr>
                        <td colSpan={3} className="p-10 text-center italic text-muted-foreground">No payment history or opening balance found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setOpenLedger(false)} className="h-9 text-xs">Close Ledger</Button>
                <Button size="sm" onClick={() => {
                   if (!selectedStudent) return;
                    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
                    const currentYear = new Date().getFullYear();
                    const issueDate = new Date().toISOString().split('T')[0];
                    const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0];
                    const c: FeeChallan = {
                      id: `CH-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                      studentId: selectedStudent.id,
                      month: currentMonth,
                      year: currentYear,
                      monthlyFee: selectedStudent.monthlyFee,
                      arrears: selectedStudent.arrears || 0,
                      arrearsDescription: selectedStudent.arrearsDescription,
                      totalPayable: selectedStudent.monthlyFee + (selectedStudent.arrears || 0),
                      issueDate,
                      dueDate,
                      status: 'issued'
                    };
                    onSaveChallans([c]);
                    setOpenLedger(false);
                    setActiveTab('challans');
                }} className="h-9 text-xs flex items-center gap-2 bg-primary">
                  <Printer size={14} /> Issued & Manage Challan
                </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimetableView({ 
  teachers, 
  slots, 
  entries, 
  onUpdateSlots, 
  onUpdateEntries 
}: { 
  teachers: Teacher[], 
  slots: TimetableSlot[], 
  entries: TimetableEntry[], 
  onUpdateSlots: (s: TimetableSlot[]) => void, 
  onUpdateEntries: (e: TimetableEntry[]) => void 
}) {
  const [selectedClass, setSelectedClass] = useState<string>(SCHOOL_CLASSES[0]);
  const [editingEntry, setEditingEntry] = useState<{ day: string, slotId: string } | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  
  const [configForm, setConfigForm] = useState({
    startTime: '08:00',
    duration: 40,
    periods: 8,
    breakAfter: 4,
    breakDuration: 30
  });

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const generateSlots = () => {
    const newSlots: TimetableSlot[] = [];
    let currentTime = configForm.startTime;

    const addMinutes = (time: string, minutes: number) => {
      const [hours, mins] = time.split(':').map(Number);
      const totalMins = hours * 60 + mins + minutes;
      const newHours = Math.floor(totalMins / 60) % 24;
      const newMins = totalMins % 60;
      return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
    };

    for (let i = 1; i <= configForm.periods; i++) {
      const endTime = addMinutes(currentTime, configForm.duration);
      newSlots.push({
        id: `period-${i}`,
        startTime: currentTime,
        endTime: endTime,
        isBreak: false,
        label: `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Period`
      });
      currentTime = endTime;

      if (i === configForm.breakAfter) {
        const breakEnd = addMinutes(currentTime, configForm.breakDuration);
        newSlots.push({
          id: `break-${i}`,
          startTime: currentTime,
          endTime: breakEnd,
          isBreak: true,
          label: 'Break / Recess'
        });
        currentTime = breakEnd;
      }
    }
    onUpdateSlots(newSlots);
    setShowConfig(false);
  };

  const handleAssign = (subject: string, teacherId: string) => {
    if (!editingEntry) return;

    const existingIndex = entries.findIndex(
      e => e.grade === selectedClass && e.day === editingEntry.day && e.slotId === editingEntry.slotId
    );

    const newEntry: TimetableEntry = {
      id: Math.random().toString(36).substr(2, 9),
      grade: selectedClass,
      day: editingEntry.day,
      slotId: editingEntry.slotId,
      subject,
      teacherId
    };

    if (existingIndex > -1) {
      const updated = [...entries];
      updated[existingIndex] = newEntry;
      onUpdateEntries(updated);
    } else {
      onUpdateEntries([...entries, newEntry]);
    }
    setEditingEntry(null);
  };

  const currentEntry = (day: string, slotId: string) => {
    return entries.find(e => e.grade === selectedClass && e.day === day && e.slotId === slotId);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableHtml = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .school-name { font-size: 28px; font-weight: 900; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: -0.025em; }
        .title { font-size: 18px; font-weight: 700; color: #64748b; margin: 5px 0 0 0; }
        .logo { height: 50px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: center; overflow: hidden; }
        th { background: #f8fafc; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; }
        .time-cell { width: 100px; background: #f8fafc; }
        .time-label { font-size: 10px; font-weight: 900; color: #2563eb; text-transform: uppercase; margin-bottom: 2px; }
        .time-range { font-size: 10px; color: #64748b; font-weight: 500; }
        .subject { font-size: 12px; font-weight: 800; margin: 0; color: #0f172a; line-height: 1.2; }
        .teacher { font-size: 10px; color: #64748b; margin: 4px 0 0 0; font-weight: 500; }
        .recess-row { background-color: #fffbeb !important; }
        .recess-text { font-size: 12px; font-weight: 900; color: #d97706; letter-spacing: 1em; text-transform: uppercase; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; pt: 20px; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
          tr { page-break-inside: avoid; }
        }
      </style>
      <div class="header">
        <div>
          <h1 class="school-name">The Smart School</h1>
          <p class="title">${selectedClass} Class Timetable Schedule</p>
        </div>
        <div style="text-align: right;">
          <img src="${SCHOOL_LOGO}" class="logo" />
          <p style="margin: 8px 0 0 0; font-weight: 800; color: #1e293b; font-size: 12px;">ACADEMIC SESSION 2026-27</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th class="time-cell">Time / Period</th>
            ${DAYS.map(day => `<th>${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${slots.map(slot => `
            <tr class="${slot.isBreak ? 'recess-row' : ''}">
              <td class="time-cell">
                <div class="time-label">${slot.label}</div>
                <div class="time-range">${slot.startTime} - ${slot.endTime}</div>
              </td>
              ${slot.isBreak ? 
                `<td colspan="${DAYS.length}" class="recess-text">R E C E S S</td>` :
                DAYS.map(day => {
                  const entry = currentEntry(day, slot.id);
                  const teacher = teachers.find(t => t.id === entry?.teacherId);
                  return `
                    <td>
                      ${entry ? `
                        <p class="subject">${entry.subject}</p>
                        <p class="teacher">${teacher?.name || '-'}</p>
                      ` : ''}
                    </td>
                  `;
                }).join('')
              }
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>This is a computer-generated document. Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        <p>&copy; School Management System 2026</p>
      </div>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedClass} Timetable</title>
          <meta charset="UTF-8">
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Class Timetable</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Weekly Period Schedule</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowConfig(true)} className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm active:scale-95">
            <Settings2 size={18} className="mr-3 opacity-60" /> Configuration
          </Button>
          <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-10 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95">
            <Printer size={20} className="mr-3" /> Print Timetable
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 no-print mb-8 overflow-x-auto pb-4 scrollbar-hide">
        {SCHOOL_CLASSES.map((grade) => (
          <button
            key={grade}
            onClick={() => setSelectedClass(grade)}
            className={cn(
              "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              selectedClass === grade 
                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 active:scale-95" 
                : "bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            Class {grade}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center border-b border-slate-100 min-w-[150px]">Sequence / Slot</th>
                {DAYS.map(day => (
                  <th key={day} className="px-8 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center border-b border-slate-100 border-l border-slate-100 min-w-[180px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 ? (
                <tr>
                   <td colSpan={DAYS.length + 1} className="p-32 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                        <CalendarCheck size={64} className="mb-6 text-slate-900" />
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4">Null Grid Detection</h3>
                        <p className="max-w-xs text-[11px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed">System requires temporal configuration to initialize the academic schedule matrix.</p>
                      </div>
                   </td>
                </tr>
              ) : (
                slots.map((slot) => (
                  <tr key={slot.id} className={cn("group", slot.isBreak && "bg-indigo-50/20")}>
                    <td className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                      <div className="text-center">
                        <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1", slot.isBreak ? "text-indigo-600" : "text-slate-400")}>{slot.label}</p>
                        <p className="text-[11px] font-black text-slate-900">{slot.startTime} — {slot.endTime}</p>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const entry = currentEntry(day, slot.id);
                      const teacher = entry ? teachers.find(t => t.id === entry.teacherId) : null;
                      
                      if (slot.isBreak) {
                        return (
                          <td key={`${day}-${slot.id}`} className="px-8 py-6 border-b border-slate-100 border-l border-slate-100 bg-indigo-50/20">
                            <div className="flex flex-col items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                              <Coffee size={24} className="text-indigo-600" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={`${day}-${slot.id}`} 
                          className="px-8 py-6 border-b border-slate-100 border-l border-slate-100 group-hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => setEditingEntry({ day, slotId: slot.id })}
                        >
                          {entry ? (
                            <div className="text-center group-hover:scale-105 transition-transform">
                              <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-2">{entry.subject}</p>
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[8px]">
                                  {teacher?.name.charAt(0)}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[80px]">
                                  {teacher?.name}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlusCircle size={20} className="text-slate-200" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-xl">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Settings2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Architecture Config</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjust Temporal Distribution</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Start Time</Label>
                <Input type="time" value={configForm.startTime} onChange={e => setConfigForm({...configForm, startTime: e.target.value})} className="h-14 rounded-2xl border-none bg-slate-100 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unit Duration (min)</Label>
                <Input type="number" value={configForm.duration} onChange={e => setConfigForm({...configForm, duration: parseInt(e.target.value)})} className="h-14 rounded-2xl border-none bg-slate-100 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Session Count</Label>
                <Input type="number" value={configForm.periods} onChange={e => setConfigForm({...configForm, periods: parseInt(e.target.value)})} className="h-14 rounded-2xl border-none bg-slate-100 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Recess Depth</Label>
                <Input type="number" value={configForm.breakAfter} onChange={e => setConfigForm({...configForm, breakAfter: parseInt(e.target.value)})} className="h-14 rounded-2xl border-none bg-slate-100 font-bold" />
              </div>
            </div>

            <Button onClick={generateSlots} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 mt-4">
              Commit Architecture Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingEntry !== null} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-xl">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <PlusCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Resource Assignment</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Subject & Faculty to Slot</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              handleAssign(f.get('subject') as string, f.get('teacherId') as string);
            }} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Academic Discipline</Label>
                <Input name="subject" required defaultValue={currentEntry(editingEntry?.day || '', editingEntry?.slotId || '')?.subject} className="h-14 rounded-2xl border-none bg-slate-100 font-bold" placeholder="e.g. Theoretical Physics" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Presiding Faculty</Label>
                <Select name="teacherId" required defaultValue={currentEntry(editingEntry?.day || '', editingEntry?.slotId || '')?.teacherId}>
                  <SelectTrigger className="h-14 rounded-2xl border-none bg-slate-100 font-bold">
                    <SelectValue placeholder="Identify Faculty Member..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id} className="rounded-xl italic">{t.name} ({t.subject || 'All'})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 mt-4">
                Commit Assignment
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExamsView({ students }: { students: Student[] }) {
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Scholarship Metrics</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Academic Evaluation & Performance Analysis</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-10 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95">
          <GraduationCap size={20} className="mr-3" /> New Examination
        </Button>
      </div>

      <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <div className="p-10 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Consolidated Result Ledger</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Terminal Session v2024.1</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input placeholder="Search student ID or name..." className="pl-12 h-14 rounded-2xl border-none bg-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-100 w-64 font-bold text-xs" />
              </div>
              <Select defaultValue="midterm">
                <SelectTrigger className="h-14 w-48 rounded-2xl border-none bg-slate-100 font-bold text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="midterm" className="rounded-xl">Mid-Term v2024</SelectItem>
                  <SelectItem value="final" className="rounded-xl">Final Exam v2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Scholar Profile</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Academic Discipline</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Score Delta</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Final Grade</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {[
                { name: 'Ali Khan', subject: 'Mathematics', score: '85/100', grade: 'A', status: 'Pass' },
                { name: 'Sara Ahmed', subject: 'Mathematics', score: '92/100', grade: 'A+', status: 'Pass' }
              ].map((res, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                        {res.name.charAt(0)}
                      </div>
                      <span className="font-black text-slate-900">{res.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-black text-[9px] uppercase tracking-widest">{res.subject}</Badge>
                  </td>
                  <td className="px-10 py-8 text-center font-bold text-slate-600">{res.score}</td>
                  <td className="px-10 py-8 text-center font-black text-xl text-indigo-600">{res.grade}</td>
                  <td className="px-10 py-8 text-right">
                    <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm">
                      {res.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CashbookView({ 
  transactions, 
  invoices
}: { 
  transactions: FinanceTransaction[],
  invoices: InventoryInvoice[]
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const dailyTransactions = useMemo(() => {
    return transactions.filter(t => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const dailyInvoices = useMemo(() => {
    return invoices.filter(i => i.date === selectedDate);
  }, [invoices, selectedDate]);

  const totalIn = dailyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) +
               dailyInvoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalAmount, 0);
               
  const totalOut = dailyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) +
                dailyInvoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.totalAmount, 0);

  const netCash = totalIn - totalOut;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Daily Cash Treasury</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Real-time Fiscal Flow Monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Log Date</Label>
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 w-44 rounded-xl border-none font-bold bg-white shadow-sm"
            />
          </div>
          <Button variant="outline" onClick={() => window.print()} className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm active:scale-95">
            <Printer size={18} className="mr-3 opacity-60" /> Day Sheet Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Inward Liquidity', value: totalIn, icon: ArrowDownRight, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
          { label: 'Outward Disbursement', value: totalOut, icon: ArrowUpLeft, color: 'text-rose-500', bg: 'bg-rose-50/50' },
          { label: 'Terminal Balance', value: netCash, icon: Wallet, color: netCash >= 0 ? 'text-indigo-600' : 'text-rose-600', bg: netCash >= 0 ? 'bg-indigo-50/50' : 'bg-rose-50/50' },
        ].map((stat, i) => (
          <Card key={i} className={cn("border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] p-8 group hover:shadow-xl transition-all duration-500", stat.bg)}>
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">PKR {Math.abs(stat.value).toLocaleString()}</h3>
            <p className={cn("text-[9px] font-black uppercase tracking-widest", stat.value >= 0 ? "text-emerald-500" : "text-rose-500")}>
              {stat.value >= 0 ? "Favorable Margin" : "Negative Delta"}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <div className="p-8 border-b border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ArrowDown size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-900 tracking-widest uppercase">Inward Ledger</h3>
                <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-tighter">Total Cash Inflows</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 font-black uppercase text-[10px] text-slate-400">Class</th>
                  <th className="px-8 py-4 font-black uppercase text-[10px] text-slate-400">Detail</th>
                  <th className="px-8 py-4 font-black uppercase text-[10px] text-slate-400 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {dailyTransactions.filter(t => t.type === 'income').map(t => (
                  <tr key={t.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900 text-[10px] uppercase">{t.category}</td>
                    <td className="px-8 py-5 text-slate-500 font-bold">{t.description}</td>
                    <td className="px-8 py-5 text-right font-black text-emerald-600">PKR {t.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {dailyInvoices.filter(i => i.type === 'sale').map(i => (
                  <tr key={i.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-5 font-black text-indigo-600 text-[10px] uppercase tracking-tighter">Inv. Sale</td>
                    <td className="px-8 py-5 text-slate-500 font-bold">Ref: #{i.id}</td>
                    <td className="px-8 py-5 text-right font-black text-emerald-600">PKR {i.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {dailyTransactions.filter(t => t.type === 'income').length === 0 && dailyInvoices.filter(i => i.type === 'sale').length === 0 && (
                   <tr><td colSpan={3} className="p-10 text-center italic text-slate-400 font-bold opacity-30">Null Inflow Detected</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <div className="p-8 border-b border-rose-100 bg-rose-50/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                <ArrowUp size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-900 tracking-widest uppercase">Outward Ledger</h3>
                <p className="text-[9px] font-bold text-rose-600/60 uppercase tracking-tighter">Total Liquidity Outflows</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 font-black uppercase text-[10px] text-slate-400">Class</th>
                  <th className="px-8 py-4 font-black uppercase text-[10px] text-slate-400">Detail</th>
                  <th className="px-8 py-4 font-black uppercase text-[10px] text-slate-400 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {dailyTransactions.filter(t => t.type === 'expense').map(t => (
                  <tr key={t.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900 text-[10px] uppercase">{t.category}</td>
                    <td className="px-8 py-5 text-slate-500 font-bold">{t.description}</td>
                    <td className="px-8 py-5 text-right font-black text-rose-600">PKR {t.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {dailyInvoices.filter(i => i.type === 'purchase').map(i => (
                  <tr key={i.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-8 py-5 font-black text-indigo-600 text-[10px] uppercase tracking-tighter">Inv. Purchase</td>
                    <td className="px-8 py-5 text-slate-500 font-bold">Ref: #{i.id}</td>
                    <td className="px-8 py-5 text-right font-black text-rose-600">PKR {i.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {dailyTransactions.filter(t => t.type === 'expense').length === 0 && dailyInvoices.filter(i => i.type === 'purchase').length === 0 && (
                   <tr><td colSpan={3} className="p-10 text-center italic text-slate-400 font-bold opacity-30">Null Outflow Detected</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FinanceView({ 
  students, 
  transactions, 
  onAddTransaction,
  onDeleteTransaction
}: { 
  students: Student[], 
  transactions: FinanceTransaction[],
  onAddTransaction: (t: FinanceTransaction) => void,
  onDeleteTransaction: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'balancesheet'>('transactions');
  const [openAdd, setOpenAdd] = useState(false);
  const [financeSearch, setFinanceSearch] = useState('');
  const [formData, setFormData] = useState({
    type: 'income' as TransactionType,
    category: 'Admission' as IncomeCategory | ExpenseCategory,
    amount: '',
    description: '',
    studentId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const incomeCategories: IncomeCategory[] = ['Admission', 'Yearly Charges', 'Tuition Fee', 'Rent', 'Stationery Sale', 'Others'];
  const expenseCategories: ExpenseCategory[] = ['Salaries', 'Utilities', 'Maintenance', 'Rent', 'Supplies', 'Marketing', 'Others'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: FinanceTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      studentId: formData.studentId || undefined,
      month: new Date(formData.date).toLocaleString('default', { month: 'long' }),
      year: new Date(formData.date).getFullYear()
    };
    onAddTransaction(newTransaction);
    setOpenAdd(false);
    setFormData({
      type: 'income',
      category: 'Admission',
      amount: '',
      description: '',
      studentId: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const searchLower = financeSearch.toLowerCase();
      const student = t.studentId ? students.find(s => s.id === t.studentId) : null;
      return (
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        (student && student.name.toLowerCase().includes(searchLower))
      );
    });
  }, [transactions, financeSearch, students]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const breakout = useMemo(() => {
    const b: { [key: string]: number } = {};
    transactions.forEach(t => {
      const key = `${t.type}:${t.category}`;
      b[key] = (b[key] || 0) + t.amount;
    });
    return b;
  }, [transactions]);

  const getBreakout = () => {
    const b: { [key: string]: number } = {};
    transactions.forEach(t => {
      const key = `${t.type}:${t.category}`;
      b[key] = (b[key] || 0) + t.amount;
    });
    return b;
  };

  const printBalanceSheet = () => {
    const breakout = getBreakout();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Balance Sheet - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</title>
          <style>
             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 60px; color: #1e293b; background: #fff; }
            .header { text-align: center; margin-bottom: 50px; border-bottom: 4px solid #0f172a; padding-bottom: 30px; }
            .school-name { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin: 0; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 60px; }
            .stat-box { padding: 25px; background: #f8fafc; border-radius: 20px; text-align: center; border: 1px solid #f1f5f9; }
            .stat-label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.2em; margin-bottom: 10px; }
            .stat-value { font-size: 24px; font-weight: 900; margin: 0; }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
            .table-container { margin-bottom: 40px; }
            .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; color: #64748b; border-left: 4px solid #3b82f6; padding-left: 15px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { padding: 16px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            .table th { font-weight: 900; font-size: 10px; text-transform: uppercase; color: #94a3b8; }
            .table td { font-weight: 700; font-size: 13px; }
            .footer { margin-top: 100px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; }
          </style>
        </head>
        <body onload="window.print();">
          <div class="header">
            <h1 class="school-name">Al-Naseeha School</h1>
            <p style="margin:8px 0; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.2em; font-size:11px;">Financial Performance Report</p>
            <p style="font-weight:900; font-size:14px; margin-top:20px;">${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
          
          <div class="summary">
            <div class="stat-box">
              <p class="stat-label">Total Revenue</p>
              <h2 class="stat-value income">PKR ${totalIncome.toLocaleString()}</h2>
            </div>
            <div class="stat-box">
              <p class="stat-label">Total Expenses</p>
              <h2 class="stat-value expense">PKR ${totalExpense.toLocaleString()}</h2>
            </div>
            <div class="stat-box">
              <p class="stat-label">Net Liquidity</p>
              <h2 class="stat-value ${netProfit >= 0 ? 'income' : 'expense'}">PKR ${Math.abs(netProfit).toLocaleString()}</h2>
            </div>
          </div>

          <div class="table-container">
            <h3 class="section-title">Revenue Breakdown</h3>
            <table class="table">
              <thead><tr><th>Category Description</th><th>Allocated Amount</th></tr></thead>
              <tbody>
                ${incomeCategories.map(cat => `
                  <tr>
                    <td>${cat}</td>
                    <td>PKR ${(breakout[`income:${cat}`] || 0).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="table-container">
            <h3 class="section-title">Expense Allocation</h3>
            <table class="table">
              <thead><tr><th>Operational Category</th><th>Incurred Amount</th></tr></thead>
              <tbody>
                ${expenseCategories.map(cat => `
                  <tr>
                    <td>${cat}</td>
                    <td>PKR ${(breakout[`expense:${cat}`] || 0).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            Digital Signature Verified • System Generated Report • Al-Naseeha Finance Dept
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Financial Oversight</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Fiscal Year {new Date().getFullYear()} • Treasury Division</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={printBalanceSheet} 
            className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm active:scale-95"
          >
            <PieChart size={18} className="mr-3 opacity-60" /> Monthly Report
          </Button>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-10 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95">
                <PlusCircle size={20} className="mr-3" /> Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <DialogTitle className="text-3xl font-black tracking-tight mb-2">Transaction Entry</DialogTitle>
                  <DialogDescription className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Financial Integrity System Protocol</DialogDescription>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px] -mr-24 -mt-24" />
              </div>
              <form onSubmit={handleSubmit} className="p-10 bg-white space-y-8">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
                  <Button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'income', category: incomeCategories[0]})}
                    className={cn(
                      "flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                      formData.type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Income
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'expense', category: expenseCategories[0]})}
                    className={cn(
                      "flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                      formData.type === 'expense' ? "bg-white text-rose-500 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Expense
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(val: any) => setFormData({...formData, category: val})}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                          <SelectItem key={cat} value={cat} className="rounded-xl">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount (PKR)</Label>
                    <Input 
                      type="number" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="h-14 rounded-2xl bg-slate-50 border-transparent font-black text-lg focus:bg-white"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
                  <Input 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief details of the transaction..."
                    className="h-14 rounded-2xl bg-slate-50 border-transparent font-bold"
                  />
                </div>

                <Button type="submit" className={cn(
                  "w-full h-16 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl text-xs transition-all",
                  formData.type === 'income' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                )}>
                  Finalize Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Fiscal Revenue', value: totalIncome, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
          { label: 'Total Expenditure', value: totalExpense, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50/50', border: 'border-rose-100' },
          { label: 'Net Liquidity', value: netProfit, icon: Wallet, color: netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600', bg: netProfit >= 0 ? 'bg-indigo-50/50' : 'bg-rose-50/50', border: netProfit >= 0 ? 'border-indigo-100' : 'border-rose-100' },
        ].map((stat, i) => (
          <Card key={i} className={`border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] p-8 ${stat.bg} group hover:shadow-xl transition-all duration-500`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-white shadow-sm ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">PKR {Math.abs(stat.value).toLocaleString()}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-tighter ${stat.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.value >= 0 ? 'Positive Balance' : 'Capital Deficit'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-[1.2rem] w-fit no-print">
        <Button 
          onClick={() => setActiveTab('transactions')} 
          variant="ghost" 
          className={cn(
            "h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
            activeTab === 'transactions' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          General Ledger
        </Button>
        <Button 
          onClick={() => setActiveTab('balancesheet')} 
          variant="ghost" 
          className={cn(
            "h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
            activeTab === 'balancesheet' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Analytical Breakdown
        </Button>
      </div>

      {activeTab === 'transactions' ? (
        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <div className="p-8 border-b border-slate-100 flex gap-4 no-print">
            <div className="relative flex-1 group">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input 
                placeholder="Search ledger by description, category, or student profile..." 
                value={financeSearch}
                onChange={(e) => setFinanceSearch(e.target.value)}
                className="pl-14 h-16 rounded-[1.5rem] border-none bg-slate-50 text-base font-medium focus:bg-white focus:ring-emerald-50 placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Temporal Log</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Entry Class</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest">Operational Detail</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-center">Invoiced Value</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredTransactions.map((t) => {
                  const student = t.studentId ? students.find(s => s.id === t.studentId) : null;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all transform group-hover:rotate-6 ${
                            t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          }`}>
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-none mb-1">{new Date(t.date).toLocaleDateString()}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.month}, {t.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <Badge className={`border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                        }`}>
                          {t.category}
                        </Badge>
                      </td>
                      <td className="px-10 py-8">
                        <div>
                          <p className="font-bold text-slate-700 leading-tight mb-1">{t.description}</p>
                          {student && (
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Rel: {student.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className={`font-black text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteTransaction(t.id)}
                          className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] p-10 bg-white">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-xs text-slate-400 mb-8 border-l-4 border-emerald-500 pl-4">Revenue Breakdown</h3>
            <div className="space-y-6">
              {incomeCategories.map(cat => (
                <div key={cat} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                    <span className="font-bold text-slate-600 uppercase tracking-widest text-[11px] group-hover:text-slate-900 transition-colors">{cat}</span>
                  </div>
                  <span className="font-black text-slate-900">PKR {(breakout[`income:${cat}`] || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] p-10 bg-white">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-xs text-slate-400 mb-8 border-l-4 border-rose-500 pl-4">Expense Allocation</h3>
            <div className="space-y-6">
              {expenseCategories.map(cat => (
                <div key={cat} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20" />
                    <span className="font-bold text-slate-600 uppercase tracking-widest text-[11px] group-hover:text-slate-900 transition-colors">{cat}</span>
                  </div>
                  <span className="font-black text-slate-900">PKR {(breakout[`expense:${cat}`] || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Reusable SearchableSelect for Inventory Items - Now allows manual "Free Select"
const SearchableSelect = ({ items, value, onSelect, placeholder, isManual = false }: { items: {id: string, name: string}[], value: string, onSelect: (id: string, name: string) => void, placeholder: string, isManual?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  
  // Check if ID matches or Name matches
  const selected = items.find(i => i.id === value || i.name === value);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={(props) => (
        <Button {...props} variant="outline" className="w-full h-8 text-[10px] justify-between px-2 font-normal bg-white">
          <span className="truncate">{selected ? selected.name : (value || placeholder)}</span>
          <Search size={12} className="opacity-50 shrink-0" />
        </Button>
      )} />
      <PopoverContent className="p-0 w-64" align="start">
        <div className="p-2 border-b bg-background sticky top-0 flex gap-2">
          <Input 
            placeholder="Search or Type..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="h-8 text-[10px] focus-visible:ring-0 flex-1"
            autoFocus
          />
          {isManual && search && !filtered.some(i => i.name.toLowerCase() === search.toLowerCase()) && (
            <Button 
              size="sm" 
              variant="secondary"
              className="h-8 text-[9px] font-bold px-2 shrink-0"
              onClick={() => {
                onSelect(search, search);
                setIsOpen(false);
                setSearch('');
              }}
            >
              Use "{search}"
            </Button>
          )}
        </div>
        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
          {filtered.length === 0 && !search && <div className="p-2 text-[10px] text-center italic text-muted-foreground">Select...</div>}
          {filtered.map(item => (
            <div 
              key={item.id} 
              className={`p-2 text-[10px] cursor-pointer rounded-md hover:bg-accent transition-colors ${value === item.id ? 'bg-accent font-bold' : ''}`}
              onClick={() => {
                onSelect(item.id, item.name);
                setIsOpen(false);
                setSearch('');
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

function InventoryView({ 
  students, 
  inventory, 
  invoices, 
  vendors,
  vendorPayments,
  onAddVendorPayment,
  onAddInvoice,
  onDeleteInvoice,
  onUpdateInvoice,
  onUpdateVendor,
  onAddVendor
}: { 
  students: Student[], 
  inventory: InventoryItem[], 
  invoices: InventoryInvoice[],
  vendors: Vendor[],
  vendorPayments: VendorPayment[],
  onAddVendorPayment: (p: VendorPayment) => void,
  onAddInvoice: (i: InventoryInvoice) => void,
  onDeleteInvoice: (id: string) => void,
  onUpdateInvoice: (i: InventoryInvoice, payment?: number) => void,
  onUpdateVendor: (v: Vendor) => void,
  onAddVendor: (v: Vendor) => void
}) {
  const [activeTab, setActiveTab] = useState<'stock' | 'purchase' | 'sale' | 'history' | 'report' | 'vendorledger'>('stock');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<'all' | 'purchase' | 'sale'>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [paymentBalanceRecord, setPaymentBalanceRecord] = useState<{ invoiceId: string; amount: string } | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [newVendorForm, setNewVendorForm] = useState({ name: '', contact: '', address: '', openingBalance: '' });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [invoiceForm, setInvoiceForm] = useState<{
    type: 'purchase' | 'sale';
    vendorName: string;
    studentId: string;
    items: { inventoryItemId: string; name: string; quantity: number; unitPrice: number; discount: number }[];
    extraExpense: string;
    extraExpenseReason: string;
    specialDiscount: string; // Flat amount
    amountPaid: string;
    date: string;
  }>({
    type: 'purchase',
    vendorName: '',
    studentId: '',
    items: [{ inventoryItemId: '', name: '', quantity: 0, unitPrice: 0, discount: 0 }],
    extraExpense: '',
    extraExpenseReason: '',
    specialDiscount: '',
    amountPaid: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Sync type with activeTab
  useEffect(() => {
    if (activeTab === 'purchase') setInvoiceForm(prev => ({ ...prev, type: 'purchase' }));
    if (activeTab === 'sale') setInvoiceForm(prev => ({ ...prev, type: 'sale' }));
  }, [activeTab]);

  const handleAddRow = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { inventoryItemId: '', name: '', quantity: 0, unitPrice: 0, discount: 0 }]
    });
  };

  const handleItemChange = (index: number, field: string, value: any, secondValue?: string) => {
    const newItems = [...invoiceForm.items];
    
    if (field === 'inventoryItemId') {
      newItems[index].inventoryItemId = value;
      newItems[index].name = secondValue || value;
      
      // Auto populate unit price if it's a known item
      const item = inventory.find(i => i.id === value);
      if (item) {
        newItems[index].unitPrice = invoiceForm.type === 'sale' ? item.salePrice : item.purchasePrice;
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const calculateTotal = () => {
    const itemsTotal = invoiceForm.items.reduce((sum, item) => {
      const discountedPrice = item.unitPrice * (1 - (item.discount || 0) / 100);
      return sum + (item.quantity * discountedPrice);
    }, 0);
    return itemsTotal + Number(invoiceForm.extraExpense || 0) - Number(invoiceForm.specialDiscount || 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    const paid = Number(invoiceForm.amountPaid || 0);
    
    let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (paid >= total) status = 'paid';
    else if (paid > 0) status = 'partial';

    const invoiceItems: InvoiceItem[] = invoiceForm.items.map(ii => {
      const discountedPrice = ii.unitPrice * (1 - (ii.discount || 0) / 100);
      return {
        inventoryItemId: ii.inventoryItemId,
        name: ii.name || 'Unknown',
        quantity: ii.quantity,
        unitPrice: ii.unitPrice,
        discount: ii.discount,
        subtotal: ii.quantity * discountedPrice
      };
    });

    const newInvoice: InventoryInvoice = {
      id: `${invoiceForm.type === 'purchase' ? 'PUR' : 'SAL'}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      type: invoiceForm.type,
      date: invoiceForm.date,
      vendorName: invoiceForm.type === 'purchase' ? invoiceForm.vendorName : undefined,
      studentId: invoiceForm.type === 'sale' ? invoiceForm.studentId : undefined,
      studentName: invoiceForm.type === 'sale' ? students.find(s => s.id === invoiceForm.studentId)?.name : undefined,
      items: invoiceItems,
      extraExpense: Number(invoiceForm.extraExpense || 0),
      extraExpenseReason: invoiceForm.extraExpenseReason,
      specialDiscount: Number(invoiceForm.specialDiscount || 0),
      totalAmount: total,
      amountPaid: paid,
      paymentStatus: status,
      month: new Date(invoiceForm.date).toLocaleString('default', { month: 'long' }),
      year: new Date(invoiceForm.date).getFullYear()
    };

    onAddInvoice(newInvoice);
    setActiveTab('history');
    setInvoiceForm({
      type: 'purchase',
      vendorName: '',
      studentId: '',
      items: [{ inventoryItemId: '', name: '', quantity: 0, unitPrice: 0, discount: 0 }],
      extraExpense: '',
      extraExpenseReason: '',
      specialDiscount: '',
      amountPaid: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const purchaseTotal = invoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.totalAmount, 0);
  const saleTotal = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalAmount, 0);
  const grossProfit = saleTotal - purchaseTotal;

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Commerce Vault</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Asset Inventory • Trade Analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-[1.5rem]">
          {[
            { id: 'stock', label: 'Asset Stock' },
            { id: 'purchase', label: 'Procurement' },
            { id: 'sale', label: 'Disbursement' },
            { id: 'history', label: 'Trade Ledger' },
            { id: 'report', label: 'Profit Audit' },
            { id: 'vendorledger', label: 'Vendor Matrix' },
          ].map((tab) => (
            <Button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              variant="ghost" 
              className={cn(
                "h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all",
                activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Modern Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-white group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <ShoppingCart size={24} />
                </div>
                <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest">Gross Sales</Badge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue Displacement</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">PKR {saleTotal.toLocaleString()}</h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-white group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <Package size={24} />
                </div>
                <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest">Procurement</Badge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Acquisition Cost</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">PKR {purchaseTotal.toLocaleString()}</h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={cn(
            "border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] group hover:shadow-xl transition-all duration-500 relative overflow-hidden",
            grossProfit >= 0 ? "bg-emerald-950 text-white" : "bg-rose-950 text-white"
          )}>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <BarChart3 size={24} className={grossProfit >= 0 ? "text-emerald-400" : "text-rose-400"} />
                </div>
                <Badge className="bg-white/10 text-white/60 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest italic font-mono">Net Yield</Badge>
              </div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", grossProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>Operating Margin</p>
              <h3 className="text-3xl font-black tracking-tight leading-none">PKR {grossProfit.toLocaleString()}</h3>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
          </Card>
        </motion.div>
      </div>

      {/* Main View Area */}
      {activeTab === 'stock' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inventory.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-white group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                 <CardContent className="p-10 text-center">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-300 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12 mx-auto mb-8 shadow-inner">
                       {item.name.charAt(0)}
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 italic">Inventory Phase: {item.category || 'Standard'}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-10">
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Stock Level</p>
                          <p className={cn(
                            "text-xl font-black",
                            item.stockQuantity <= item.minStockLevel ? "text-rose-600" : "text-slate-900"
                          )}>{item.stockQuantity} <span className="text-[10px] uppercase">{item.unit}</span></p>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Market Rate</p>
                          <p className="text-xl font-black text-slate-900">Rs. {item.salePrice}</p>
                       </div>
                    </div>

                    <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[9px] hover:bg-slate-50 transition-all active:scale-95">
                      Adjust Provisions
                    </Button>
                 </CardContent>
              </Card>
            </motion.div>
          ))}
          {inventory.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
               <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                 <Package size={48} />
               </div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Zero Artifacts Detected</h3>
               <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest italic">Provisioning Required</p>
            </div>
          )}
        </div>
      )}

      {(activeTab === 'purchase' || activeTab === 'sale') && (
        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="p-10 border-b border-slate-100">
             <div className="flex items-center gap-4">
               <div className={cn(
                 "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                 activeTab === 'purchase' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
               )}>
                 {activeTab === 'purchase' ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
               </div>
               <CardTitle className="text-2xl font-black tracking-tight">{activeTab === 'purchase' ? 'Procurement Phase' : 'Disbursement Phase'}</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Trade Associate</Label>
                   {activeTab === 'purchase' ? (
                     <Select value={invoiceForm.vendorName} onValueChange={(val) => setInvoiceForm({...invoiceForm, vendorName: val})}>
                       <SelectTrigger className="h-14 rounded-2xl border-none bg-slate-50 font-bold">
                         <SelectValue placeholder="Select Vendor Platform..." />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl border-none shadow-2xl">
                         {vendors.map(v => <SelectItem key={v.id} value={v.name} className="rounded-xl">{v.name}</SelectItem>)}
                         <SelectItem value="Other..." className="rounded-xl italic">New Associate...</SelectItem>
                       </SelectContent>
                     </Select>
                   ) : (
                     <Select value={invoiceForm.studentId} onValueChange={(val) => setInvoiceForm({...invoiceForm, studentId: val})}>
                       <SelectTrigger className="h-14 rounded-2xl border-none bg-slate-50 font-bold">
                         <SelectValue placeholder="Identify Consignee..." />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl border-none shadow-2xl">
                         <ScrollArea className="h-80">
                            {students.map(s => <SelectItem key={s.id} value={s.id} className="rounded-xl">{s.name} ({s.currentClass})</SelectItem>)}
                         </ScrollArea>
                       </SelectContent>
                     </Select>
                   )}
                 </div>
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Transaction Sync Date</Label>
                   <Input type="date" value={invoiceForm.date} onChange={(e) => setInvoiceForm({...invoiceForm, date: e.target.value})} className="h-14 rounded-2xl border-none bg-slate-50 font-bold" />
                 </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Item List</h5>
                   <Button type="button" variant="outline" onClick={handleAddRow} className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[9px] hover:bg-slate-50">
                     <Plus size={14} className="mr-2" /> Add Item
                   </Button>
                </div>
                {invoiceForm.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end group">
                    <div className="space-y-2 md:col-span-1">
                      <Label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Inventory Asset</Label>
                      <Select value={it.inventoryItemId} onValueChange={(val) => {
                        const itm = inventory.find(i => i.id === val);
                        handleItemChange(idx, 'inventoryItemId', val, itm?.name);
                      }}>
                        <SelectTrigger className="h-12 rounded-xl border-none bg-slate-50 font-bold group-hover:bg-slate-100 transition-colors">
                          <SelectValue placeholder="Sync Item..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          {inventory.map(inv => <SelectItem key={inv.id} value={inv.id} className="rounded-lg">{inv.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Quantity</Label>
                       <Input type="number" value={it.quantity} onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} className="h-12 rounded-xl border-none bg-slate-50 font-bold group-hover:bg-slate-100 transition-colors" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Unit Price</Label>
                       <Input type="number" value={it.unitPrice} onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))} className="h-12 rounded-xl border-none bg-slate-50 font-bold group-hover:bg-slate-100 transition-colors" />
                    </div>
                    <div className="space-y-2 flex items-center gap-3">
                       <div className="flex-1">
                         <Label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Disc. %</Label>
                         <Input type="number" value={it.discount} onChange={(e) => handleItemChange(idx, 'discount', Number(e.target.value))} className="h-12 rounded-xl border-none bg-slate-50 font-bold group-hover:bg-slate-100 transition-colors" />
                       </div>
                       <Button type="button" variant="ghost" className="h-12 w-12 rounded-xl text-rose-200 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all" onClick={() => {
                          const newItems = [...invoiceForm.items];
                          newItems.splice(idx, 1);
                          setInvoiceForm({...invoiceForm, items: newItems});
                       }}>
                          <Trash2 size={16} />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="grid grid-cols-2 gap-10 flex-1 w-full">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Expenses</Label>
                      <Input value={invoiceForm.extraExpense} onChange={(e) => setInvoiceForm({...invoiceForm, extraExpense: e.target.value})} className="h-14 rounded-2xl border-none bg-white/5 font-bold text-white focus:bg-white/10" placeholder="0.00" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement Paid</Label>
                      <Input value={invoiceForm.amountPaid} onChange={(e) => setInvoiceForm({...invoiceForm, amountPaid: e.target.value})} className="h-14 rounded-2xl border-none bg-white/5 font-bold text-white focus:bg-white/10" placeholder="0.00" />
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none">Net Payable Balance</p>
                    <h3 className="text-5xl font-black text-white tracking-tighter leading-none mb-1">PKR {calculateTotal().toLocaleString()}</h3>
                    <Button type="submit" className={cn(
                      "mt-6 h-16 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all active:scale-95",
                      activeTab === 'purchase' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
                    )}>
                      {activeTab === 'purchase' ? <ArrowDownCircle size={20} className="mr-3" /> : <ArrowUpCircle size={20} className="mr-3" />}
                      Finalize Settlement
                    </Button>
                 </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
          <div className="p-10 border-b border-slate-100 flex items-center justify-between no-print">
             <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Resource Trade History</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Chronological Audit of All Operations</p>
             </div>
             <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
                {['all', 'purchase', 'sale'].map((f) => (
                  <Button 
                    key={f}
                    onClick={() => setInvoiceTypeFilter(f as any)} 
                    variant="ghost" 
                    className={cn(
                      "h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px]",
                      invoiceTypeFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                    )}
                  >
                    {f}
                  </Button>
                ))}
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-10 py-6 text-left">Manifest ID</th>
                  <th className="px-10 py-6 text-left">Associate / Consignee</th>
                  <th className="px-10 py-6 text-center">Trade Type</th>
                  <th className="px-10 py-6 text-center">Settlement Status</th>
                  <th className="px-10 py-6 text-right">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {invoices.filter(i => invoiceTypeFilter === 'all' || i.type === invoiceTypeFilter).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="px-10 py-8">
                       <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{inv.id}</p>
                       <p className="text-[9px] font-bold text-slate-300 mt-1">{inv.date}</p>
                    </td>
                    <td className="px-10 py-8">
                       {inv.type === 'purchase' ? (
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-[10px] font-black">{inv.vendorName?.charAt(0)}</div>
                           <p className="font-bold text-slate-600">{inv.vendorName}</p>
                         </div>
                       ) : (
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black">{inv.studentName?.charAt(0)}</div>
                           <p className="font-bold text-slate-600">{inv.studentName}</p>
                         </div>
                       )}
                    </td>
                    <td className="px-10 py-8 text-center">
                       <Badge className={cn(
                         "px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                         inv.type === 'purchase' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                       )}>
                         {inv.type}
                       </Badge>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <Badge className={cn(
                         "px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                         inv.paymentStatus === 'paid' ? "bg-emerald-50 text-emerald-600" : inv.paymentStatus === 'partial' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                       )}>
                         {inv.paymentStatus}
                       </Badge>
                    </td>
                    <td className="px-10 py-8 text-right font-black text-slate-900">PKR {inv.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Rest of implementation... (Vendor Ledger etc if needed) */}
    </div>
  );
}

// Logic helpers for the above
function calculateVendorMetrics(selectedVendor: string, invoices: InventoryInvoice[], vendorPayments: VendorPayment[]) {
  if (!selectedVendor) return [];
  const purchases = invoices.filter(i => i.type === 'purchase' && i.vendorName === selectedVendor);
  const payments = vendorPayments.filter(p => p.vendorName === selectedVendor);
  
  return [
    ...purchases.map(p => ({ date: p.date, description: `Invoice #${p.id}`, debit: p.totalAmount, credit: 0 })),
    ...payments.map(p => ({ date: p.date, description: p.description, debit: 0, credit: p.amount }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function SessionManagementView({ 
  students, 
  session,
  onPromote,
  onUpdateSession
}: { 
  students: Student[], 
  session: string,
  onPromote: (s: Student[]) => void,
  onUpdateSession: (s: string) => void
}) {
  const [newSession, setNewSession] = useState(session);
  const [isPromoting, setIsPromoting] = useState(false);

  const handlePromote = () => {
    if (!window.confirm("Are you sure? This will promote all students to the next class based on the sequence. This action is irreversible.")) return;
    
    setIsPromoting(true);
    setTimeout(() => {
      const promotedStudents = students.map(s => ({
        ...s,
        grade: SESSION_SEQUENCE[s.grade] || s.grade
      }));
      onPromote(promotedStudents);
      setIsPromoting(false);
      alert("Promotion successful! Students have been moved to their next classes.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight">Session Management</h2>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-xs">
          Current: {session}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">Update Current Session</CardTitle>
            <CardDescription className="text-xs">Set the active academic session name (e.g., 2024-25).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Academic Session Name</Label>
              <Input 
                value={newSession} 
                onChange={(e) => setNewSession(e.target.value)}
                placeholder="e.g. 2024-25"
                className="h-10 text-sm"
              />
            </div>
            <Button 
              onClick={() => onUpdateSession(newSession)}
              className="w-full bg-primary h-10 text-xs font-bold"
            >Update Session Info</Button>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-none rounded-xl bg-amber-50/30 border-amber-100">
          <CardHeader>
            <CardTitle className="text-base font-bold text-amber-800">Mass Student Promotion</CardTitle>
            <CardDescription className="text-xs text-amber-600/80">Promote all students to their next level (e.g. 9th to 10th). Graduation class will be marked Alumnus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white border border-amber-200 rounded-lg space-y-2 text-[11px] text-amber-800">
              <p><strong>Note:</strong> Ensure all final exams are marked before clicking.</p>
              <p><strong>Sequence:</strong> PG → Nursery → KG → 1st ... → 10th → Alumnus</p>
            </div>
            <Button 
              onClick={handlePromote}
              disabled={isPromoting}
              className="w-full bg-amber-600 hover:bg-amber-700 h-10 text-xs font-bold flex items-center gap-2"
            >
              {isPromoting ? 'Promoting Students...' : <><RefreshCw size={14} /> Run Promotion Logic</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BalanceSheetView({ 
  transactions, 
  openingBalance,
  onUpdateOpeningBalance
}: { 
  transactions: FinanceTransaction[], 
  openingBalance: number,
  onUpdateOpeningBalance: (val: number) => void
}) {
  const [editOpening, setEditOpening] = useState(false);
  const [openingVal, setOpeningVal] = useState(openingBalance.toString());

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const cashInHand = netProfit + openingBalance;

  return (
    <div className="space-y-8 no-print">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Financial Balance Sheet</h2>
          <p className="text-xs text-muted-foreground capitalize">Overall financial health and cash-in-hand summary</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => window.print()} className="h-9 text-xs border-border">
            <Printer size={14} className="mr-2" /> Print Summary
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="border-none shadow-sm bg-blue-600 text-white rounded-2xl p-6">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-white/10 rounded-lg"><Calculator size={18} /></div>
             <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditOpening(!editOpening)}
              className="text-[10px] h-6 px-2 bg-white/10 hover:bg-white/20 text-white border-none uppercase font-bold"
             >Set Opening</Button>
           </div>
           <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Opening Balance</p>
           <h3 className="text-2xl font-black">Rs.{openingBalance.toLocaleString()}</h3>
           {editOpening && (
             <div className="mt-3 flex gap-2">
               <Input 
                value={openingVal} 
                onChange={(e) => setOpeningVal(e.target.value)}
                className="h-8 text-xs bg-white text-black border-none"
                placeholder="0"
               />
               <Button 
                onClick={() => {
                  onUpdateOpeningBalance(Number(openingVal));
                  setEditOpening(false);
                }}
                className="h-8 text-[10px] bg-emerald-500 hover:bg-emerald-600 border-none px-2 font-bold"
               >Save</Button>
             </div>
           )}
         </Card>

         <Card className="border border-border shadow-none rounded-2xl p-6">
           <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg w-fit mb-4"><ArrowUpCircle size={18} /></div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Income</p>
           <h3 className="text-2xl font-black text-foreground">Rs.{totalIncome.toLocaleString()}</h3>
         </Card>

         <Card className="border border-border shadow-none rounded-2xl p-6">
           <div className="p-2 bg-red-100 text-red-600 rounded-lg w-fit mb-4"><ArrowDownCircle size={18} /></div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Expense</p>
           <h3 className="text-2xl font-black text-foreground">Rs.{totalExpense.toLocaleString()}</h3>
         </Card>

         <Card className="border-none shadow-sm bg-accent text-white rounded-2xl p-6">
           <div className="p-2 bg-white/10 rounded-lg w-fit mb-4"><Wallet size={18} /></div>
           <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Cash in Hand (Net)</p>
           <h3 className="text-2xl font-black">Rs.{cashInHand.toLocaleString()}</h3>
         </Card>
      </div>

      <Card className="border border-border shadow-none rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
           <CardTitle className="text-sm font-bold flex items-center justify-between">
            Financial Ledger Breakdown
            <Badge variant="outline" className={cashInHand > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}>
              {cashInHand > 0 ? 'Surplus' : 'Deficit'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-background border-b text-[11px] font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Item Description</th>
                <th className="px-6 py-4 text-emerald-600">Credit (In)</th>
                <th className="px-6 py-4 text-red-600">Debit (Out)</th>
                <th className="px-6 py-4 text-right">Running Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-muted/10 font-medium">
                <td className="px-6 py-4">Session Opening Balance (Previous Cash)</td>
                <td className="px-6 py-4 text-emerald-600">Rs.{openingBalance.toLocaleString()}</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4 text-right font-bold">Rs.{openingBalance.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="px-6 py-4">Current Session Income (Fees, Sales, etc.)</td>
                <td className="px-6 py-4 text-emerald-600">Rs.{totalIncome.toLocaleString()}</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4 text-right">Rs.{(openingBalance + totalIncome).toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="px-6 py-4">Current Session Expenses (Salaries, Utils, etc.)</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4 text-red-600">Rs.{totalExpense.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">Rs.{cashInHand.toLocaleString()}</td>
              </tr>
              <tr className="bg-accent text-white font-black text-base">
                <td className="px-6 py-5">CURRENT CASH STATUS (IN-HAND)</td>
                <td colSpan={2}></td>
                <td className="px-6 py-5 text-right">Rs.{cashInHand.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function AnnouncementsView() {
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Bureau of Communication</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Institutional Announcements & Directives</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-10 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95">
          <BellPlus size={20} className="mr-3" /> Broadcast Directive
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { id: '1', title: 'Session Re-orientation', date: '25 OCT 2024', content: 'In accordance with the new academic guidelines, the orientation session for the upcoming semester has been rescheduled to provide optimized student integration.', targetRole: 'ALL PERS.' },
          { id: '2', title: 'Digital Infrastructure Update', date: '20 OCT 2024', content: 'System maintenance scheduled for Sunday to enhance cloud database performance across the enterprise management portal.', targetRole: 'FACULTY' },
          { id: '3', title: 'Annual Fiscal Audit', date: '15 OCT 2024', content: 'Departments are requested to finalize ledger records for the internal treasury audit scheduled for next month.', targetRole: 'ADMIN' },
        ].map((ann, i) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500 border-l-[6px] border-indigo-600/20 hover:border-indigo-600">
              <CardContent className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6">
                    <Send size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ann.date}</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8 opacity-80 line-clamp-3">{ann.content}</p>
                <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{ann.targetRole}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-xl"><Edit3 size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: (user: UserProfile) => void }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await authService.login(loginId, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid login ID or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="flex justify-center mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-accent blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl relative z-10 overflow-hidden transform transition-transform group-hover:rotate-6">
                <img 
                  src={SCHOOL_LOGO} 
                  alt="School Logo" 
                  className="w-16 h-16 object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2913/2913008.png';
                  }}
                />
              </div>
            </div>
          </motion.div>
          <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase italic underline decoration-accent underline-offset-8 decoration-4">
            Al-Naseeha School
          </h2>
          <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Institutional Management Portal
          </p>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden p-10 md:p-14">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Authorized Login ID</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                  <UserSquare2 size={20} />
                </div>
                <Input 
                  type="text" 
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder="e.g. jahanzeb" 
                  className="pl-14 h-14 bg-black/40 border-white/10 text-white focus:bg-black/60 focus:ring-accent/50 focus:border-accent/50 rounded-2xl transition-all placeholder:text-slate-700 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Access Key</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors">
                  <CreditCard size={20} />
                </div>
                <Input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-14 h-14 bg-black/40 border-white/10 text-white focus:bg-black/60 focus:ring-accent/50 focus:border-accent/50 rounded-2xl transition-all placeholder:text-slate-700"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-bold text-red-400 bg-red-400/10 p-4 rounded-2xl border border-red-400/20 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-[0.2em] rounded-[1.2rem] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-accent/20 text-xs mt-10"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <RefreshCw className="animate-spin" size={18} /> Validating Credentials...
                </span>
              ) : 'Authenticate Access'}
            </Button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-600 mb-6 flex items-center justify-center gap-4">
              <span className="h-px bg-white/5 flex-1" />
              Security Protocol
              <span className="h-px bg-white/5 flex-1" />
            </p>
            <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">AES-256 Encryption</div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">Session Monitoring</div>
            </div>
          </div>
        </Card>
        
        <p className="text-center text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] mt-12 mb-20 opacity-50">
          Smart School OS • Enterprise Edition v4.0
        </p>
      </motion.div>
    </div>
  );
}

function StudentDashboardView({ student }: { student: Student }) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tight">Welcome, {student.name}!</h2>
          <p className="text-muted-foreground font-medium italic">Student ID: {student.rollNumber} | Class: {student.grade}-{student.section}</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-border">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><TrendingUp size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Attendance</p>
            <p className="text-lg font-black text-primary">94.2%</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border shadow-none rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-accent/5 transition-all group">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"><CreditCard size={24} /></div>
            <h3 className="text-lg font-black text-primary mb-1">Fee Status</h3>
            <p className="text-xs text-muted-foreground font-medium mb-4">No pending dues for current month</p>
            <Button className="w-full bg-primary text-white text-xs h-9 uppercase font-bold tracking-widest">Download Slip</Button>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-none rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-accent/5 transition-all group">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"><GraduationCap size={24} /></div>
            <h3 className="text-lg font-black text-primary mb-1">Reports & Grades</h3>
            <p className="text-xs text-muted-foreground font-medium mb-4">First term result is now available</p>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 uppercase font-bold tracking-widest">View Result</Button>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-none rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-accent/5 transition-all group">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"><BookOpen size={24} /></div>
            <h3 className="text-lg font-black text-primary mb-1">Time Table</h3>
            <p className="text-xs text-muted-foreground font-medium mb-4">Check your daily period schedule</p>
            <Button variant="outline" className="w-full border-amber-200 text-amber-600 hover:bg-amber-50 text-xs h-9 uppercase font-bold tracking-widest">Open Schedule</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-none rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-6">
          <CardTitle className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-primary">
            <Bell size={18} className="text-accent" /> Recent Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[].map((ann: any) => (
              <div key={ann.id} className="p-6 hover:bg-accent/5 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground group-hover:text-accent transition-colors">{ann.title}</h4>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{ann.date}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
