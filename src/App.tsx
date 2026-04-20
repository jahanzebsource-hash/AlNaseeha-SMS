/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
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
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
import { isCloudEnabled } from './services/firebase';
import { 
  mockStudents, 
  mockTeachers, 
  mockAnnouncements, 
  mockAttendance, 
  mockFees,
  mockTransactions,
  mockInventory,
  mockVendors,
  mockVendorPayments
} from './lib/mockData';

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

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance as Attendance[]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(mockFees as FeeRecord[]);
  const [feeChallans, setFeeChallans] = useState<FeeChallan[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(mockTransactions);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [invoices, setInvoices] = useState<InventoryInvoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(mockVendorPayments);
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
      const storedStudents = await smartDB.getAllRecords('students');
      if (storedStudents.length > 0) setStudents(storedStudents);
      
      const storedTeachers = await smartDB.getAllRecords('teachers');
      if (storedTeachers.length > 0) setTeachers(storedTeachers);
      
      const storedTransactions = await smartDB.getAllRecords('transactions');
      if (storedTransactions.length > 0) setTransactions(storedTransactions);
    };
    loadInitialData();
  }, []);

  // Auto-sync effect (Simplified example for students)
  useEffect(() => {
    if (students !== mockStudents) {
      students.forEach(s => smartDB.saveRecord('students', s));
    }
  }, [students]);

  const totalMonthlyFee = useMemo(() => {
    return students.reduce((sum, student) => sum + student.monthlyFee, 0);
  }, [students]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'principal', 'teacher', 'accountant'] },
    { id: 'students', label: 'Student Management', icon: Users, roles: ['admin', 'principal', 'accountant'] },
    { id: 'teachers', label: 'Staff & Teachers', icon: UserSquare2, roles: ['admin', 'principal', 'accountant'] },
    { id: 'attendance', label: 'Attendance System', icon: CalendarCheck, roles: ['admin', 'principal', 'teacher', 'accountant'] },
    { id: 'fees', label: 'Fee & Financials', icon: CreditCard, roles: ['admin', 'principal', 'accountant'] },
    { id: 'finance', label: 'Income & Expense', icon: Receipt, roles: ['admin', 'principal', 'accountant'] },
    { id: 'cashbook', label: 'Daily Cashbook', icon: Calculator, roles: ['admin', 'principal', 'accountant'] },
    { id: 'inventory', label: 'Inventory & Sale', icon: Package, roles: ['admin', 'principal', 'accountant'] },
    { id: 'timetable', label: 'Time Table', icon: BookOpen, roles: ['admin', 'principal', 'teacher', 'student'] },
    { id: 'session', label: 'Session & Promo', icon: RefreshCw, roles: ['admin', 'principal'] },
    { id: 'balancesheet', label: 'Balance Sheet', icon: BarChart3, roles: ['admin', 'principal', 'accountant'] },
    { id: 'exams', label: 'Examinations', icon: GraduationCap, roles: ['admin', 'principal', 'teacher', 'accountant'] },
    { id: 'announcements', label: 'Announcements', icon: Bell, roles: ['all'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !user || item.roles.includes('all') || item.roles.includes(user.role)
  );

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const renderView = () => {
    if (user?.role === 'student') {
      const studentData = students.find(s => s.email === user.email) || mockStudents[0];
      return <StudentDashboardView student={studentData} />;
    }

    const displayStudents = user?.role === 'teacher' && user.assignedClass 
      ? students.filter(s => s.grade === user.assignedClass)
      : students;

    switch (activeView) {
      case 'dashboard':
        return <DashboardView totalMonthlyFee={totalMonthlyFee} recentStudents={students.slice(-4).reverse()} setActiveView={setActiveView} />;
      case 'students':
        return <StudentsView students={displayStudents} onAddStudent={(s) => setStudents(prev => prev.some(item => item.id === s.id) ? prev.map(item => item.id === s.id ? s : item) : [...prev, s])} />;
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
        return <DashboardView totalMonthlyFee={totalMonthlyFee} recentStudents={students.slice(-4).reverse()} setActiveView={setActiveView} />;
    }
  };

  if (!user) {
    return <LoginView onLogin={(user) => setUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'w-[240px]' : 'w-20'
        } fixed inset-y-0 left-0 z-50 border-r border-sidebar-border no-print`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-white rounded-lg shrink-0 flex items-center justify-center p-1 border border-sidebar-border overflow-hidden">
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
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">
                Al-Naseeha<br/>High School
              </h1>
            </motion.div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <nav className="flex-1 space-y-0 mt-4">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center px-6 py-3 transition-all border-l-4 ${
                activeView === item.id 
                  ? 'bg-sidebar-accent text-white border-accent' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white border-transparent'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-sidebar-foreground hover:text-red-400 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[240px]' : 'ml-20'}`}>
        <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-between sticky top-0 z-40 no-print">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search student ID, staff or files..." 
              className="pl-10 w-[300px] bg-background border-border text-xs h-9 focus:ring-accent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-border pr-4 no-print">
               <div className="flex flex-col items-end mr-2">
                 <Badge variant="outline" className={`text-[8px] uppercase px-1 h-4 flex items-center gap-1 ${isCloudEnabled ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-amber-500 text-amber-600 bg-amber-50'}`}>
                   <div className={`w-1 h-1 rounded-full ${isCloudEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                   {isCloudEnabled ? 'Cloud Sync active' : 'Smart-Local mode'}
                 </Badge>
               </div>
               <Popover>
                <PopoverTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-[10px] font-bold text-accent uppercase tracking-widest gap-2")}>
                  <UserSquare2 size={14} /> Switch Role
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 bg-white border-border shadow-2xl rounded-xl">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase px-2 py-1 tracking-widest">Select Demo Account</p>
                    {/* Demo accounts removed */}
                    {[].map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          authService.login(u.email, '123');
                          setUser(authService.getCurrentUser());
                          setActiveView('dashboard');
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
              <div className="text-[11px] text-muted-foreground uppercase">{user?.role} | Session: 2023-24</div>
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

function DashboardView({ totalMonthlyFee, recentStudents, setActiveView }: { totalMonthlyFee: number, recentStudents: Student[], setActiveView: (v: View) => void }) {
  const stats = [
    { label: 'Total Students', value: recentStudents.length.toString(), delta: '+24 this month', icon: Users, color: 'text-blue-600' },
    { label: 'Active Teachers', value: '86', delta: '98% Attendance', icon: UserSquare2, color: 'text-emerald-600' },
    { label: 'Monthly Income', value: `Rs.${totalMonthlyFee.toLocaleString()}`, delta: 'Total Fee Demand', icon: CreditCard, color: 'text-amber-600' },
    { label: 'Daily Attendance', value: '94.2%', delta: 'Trending upwards', icon: CalendarCheck, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-border shadow-none rounded-xl">
            <CardContent className="p-5">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-2">{stat.label}</p>
              <h3 className="text-2xl font-bold text-primary">{stat.value}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">{stat.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Recent Admissions</CardTitle>
            </div>
            <Button variant="link" className="text-xs text-accent p-0 h-auto">View All Students</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background text-muted-foreground font-bold border-b-2 border-background">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Roll No</th>
                    <th className="px-6 py-3">Class</th>
                    <th className="px-6 py-3">Fee</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentStudents.map((row, i) => (
                    <tr key={i} className="hover:bg-background transition-colors">
                      <td className="px-6 py-3 font-medium text-foreground">{row.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">#{row.rollNumber}</td>
                      <td className="px-6 py-3 text-muted-foreground">{row.grade}</td>
                      <td className="px-6 py-3 text-muted-foreground">Rs.{row.monthlyFee.toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-border shadow-none rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              {[
                { time: '08:30 AM', title: 'Morning Assembly', desc: 'Main Ground • All Grades' },
                { time: '10:00 AM', title: 'Staff Meeting', desc: 'Conference Hall A' },
                { time: '12:45 PM', title: 'Board Exam Briefing', desc: 'Auditorium • Grade 10-12' },
              ].map((item, i) => (
                <div key={i} className={`flex gap-3 p-4 ${i !== 2 ? 'border-b border-border' : ''}`}>
                  <div className="bg-background px-2 py-1 rounded text-[10px] font-bold h-fit min-w-[65px] text-center">
                    {item.time}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-white border-none shadow-none rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-white">Quick Action</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 p-4 pt-0">
              <Button 
                onClick={() => setActiveView('students')}
                className="flex-1 bg-white/10 hover:bg-white/20 text-[11px] h-9 border-none"
              >Add Student</Button>
              <Button 
                onClick={() => setActiveView('fees')}
                className="flex-1 bg-white/10 hover:bg-white/20 text-[11px] h-9 border-none"
              >Pay Fees</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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

function StudentsView({ students, onAddStudent }: { students: Student[], onAddStudent: (s: Student) => void }) {
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesClass = filterClass === 'all' || s.grade === filterClass;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.rollNumber.includes(searchQuery);
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
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingStudent(null);
      setFormData({ name: '', parentName: '', parentContact: '', dateOfBirth: '', monthlyFee: '', grade: '', section: '', rollNumber: '', arrears: '', arrearsDescription: '' });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      parentName: student.parentName,
      parentContact: student.parentContact,
      dateOfBirth: student.dateOfBirth,
      monthlyFee: student.monthlyFee.toString(),
      grade: student.grade,
      section: student.section,
      rollNumber: student.rollNumber,
      arrears: (student.arrears || 0).toString(),
      arrearsDescription: student.arrearsDescription || '',
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
      address: editingStudent?.address || '',
      createdAt: editingStudent?.createdAt || new Date().toISOString(),
    };
    onAddStudent(updatedStudent);
    handleOpenChange(false);
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search by name or roll number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs border-border"
          />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[180px] h-10 text-xs border-border">
            <Filter size={14} className="mr-2" />
            <SelectValue placeholder="Filter by Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {uniqueClasses.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handlePrint} className="h-10 text-xs border-border">
          <Printer size={16} className="mr-2" /> Print List
        </Button>
      </div>

      <Card className="border border-border shadow-none rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-white no-print">
          <div>
            <CardTitle className="text-lg font-bold">Student Directory</CardTitle>
            <CardDescription className="text-xs">
              {filterClass === 'all' ? 'Showing all students' : `Showing Grade ${filterClass}`}
            </CardDescription>
          </div>
          
          <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger render={(props) => (
            <Button {...props} className="bg-accent hover:bg-accent/90 text-white h-9 text-xs">
              <Plus size={16} className="mr-2" /> Admission Form
            </Button>
          )} />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student Details' : 'New Student Admission'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Update info for existing student.' : 'Enter the details for the new student enrollment.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-xs">Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="col-span-3 h-8 text-xs" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parent" className="text-right text-xs">Father Name</Label>
                <Input id="parent" value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} className="col-span-3 h-8 text-xs" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right text-xs">Mobile No</Label>
                <Input id="contact" placeholder="e.g. 923001234567" value={formData.parentContact} onChange={(e) => setFormData({...formData, parentContact: e.target.value})} className="col-span-3 h-8 text-xs" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dob" className="text-right text-xs">D.O.B</Label>
                <Input id="dob" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="col-span-3 h-8 text-xs" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fee" className="text-right text-xs">Monthly Fee</Label>
                <Input id="fee" type="number" value={formData.monthlyFee} onChange={(e) => setFormData({...formData, monthlyFee: e.target.value})} className="col-span-3 h-8 text-xs" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roll" className="text-right text-xs">Roll No</Label>
                <Input id="roll" value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} className="col-span-3 h-8 text-xs" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="arrears" className="text-right text-xs">Arrears (PKR)</Label>
                <Input id="arrears" type="number" value={formData.arrears} onChange={(e) => setFormData({...formData, arrears: e.target.value})} className="col-span-3 h-8 text-xs" placeholder="Previous pending fee" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="arrearsDesc" className="text-right text-xs">Arrears Desc</Label>
                <Input id="arrearsDesc" value={formData.arrearsDescription} onChange={(e) => setFormData({...formData, arrearsDescription: e.target.value})} className="col-span-3 h-8 text-xs" placeholder="Reason for arrears" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label htmlFor="grade" className="text-right text-xs">Grade</Label>
                  <Select value={formData.grade} onValueChange={(v) => setFormData({...formData, grade: v})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label htmlFor="section" className="text-right text-xs">Sec</Label>
                  <Input id="section" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} className="h-8 text-xs" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-accent h-8 text-xs">Submit Admission</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <div className="print-only mb-8 text-center p-6 border-b-2 border-primary relative">
          <div className="absolute left-6 top-6 h-20 w-20">
             <img src={SCHOOL_LOGO} alt="School Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-primary">Al-Naseeha High School</h1>
          <h2 className="text-xl font-bold mt-2">Student List - {filterClass === 'all' ? 'All Classes' : `Grade ${filterClass}`}</h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">Generated on: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-background text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Parent Name</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4 no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <Avatar className="h-7 w-7 no-print">
                      <AvatarFallback className="text-[10px]">{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">{student.name}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-muted-foreground">{student.grade} - {student.section}</td>
                  <td className="px-6 py-4 text-muted-foreground">{student.parentName}</td>
                  <td className="px-6 py-4 text-muted-foreground font-bold">Rs.{student.monthlyFee}</td>
                  <td className="px-6 py-4 no-print">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(student)}
                      className="text-accent hover:text-accent/80 hover:bg-accent/10 text-[11px] h-7"
                    >Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
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
        alert("Failed to save staff. Check if Login ID is unique.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving staff member.");
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
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
      password: staffForm.password || undefined, // Only send if changed
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
        setSelectedStaff(null);
        setStaffForm({ 
          name: '', designation: '', employeeId: '', contactNumber: '', 
          baseSalary: '', qualification: '', assignedClass: '', 
          loginId: '', password: '', role: 'teacher', isTeaching: true 
        });
      }
    } catch (err) {
      console.error(err);
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
      year: 2024,
      baseSalary: selectedStaff.baseSalary,
      bonus,
      deductions,
      netSalary,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
    };

    onGeneratePayroll(newRecord);
    setOpenPayroll(false);
    setPayrollForm({ bonus: '0', deductions: '0', month: 'May' });
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
            .salary-slip { border: 1px dashed #666; padding: 20px; margin-bottom: 20px; height: 300px; page-break-inside: avoid; }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 no-print">
        <div className="flex bg-muted p-1 rounded-lg">
          <Button 
            variant={view === 'staff' ? 'default' : 'ghost'} 
            onClick={() => setView('staff')}
            className="text-xs h-8 px-4"
          >Staff Management</Button>
          <Button 
            variant={view === 'payroll' ? 'default' : 'ghost'} 
            onClick={() => setView('payroll')}
            className="text-xs h-8 px-4"
          >Payroll & Salary</Button>
        </div>
        <div>
          {view === 'staff' ? (
            <Dialog open={openAddStaff} onOpenChange={setOpenAddStaff}>
              <DialogTrigger render={(props) => (
                <Button {...props} className="bg-accent text-white h-9 text-xs">
                  <Plus size={16} className="mr-2" /> Add Staff Member
                </Button>
              )} />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                  <DialogDescription>Enter employment details for the new staff member.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddStaff} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="staffName" className="text-right text-xs">Name</Label>
                    <Input id="staffName" value={staffForm.name} onChange={(e) => setStaffForm({...staffForm, name: e.target.value})} className="col-span-3 h-8 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="desig" className="text-right text-xs">Designation</Label>
                    <Input id="desig" value={staffForm.designation} onChange={(e) => setStaffForm({...staffForm, designation: e.target.value})} className="col-span-3 h-8 text-xs" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="empId" className="text-right text-xs">Employee ID</Label>
                    <Input id="empId" value={staffForm.employeeId} onChange={(e) => setStaffForm({...staffForm, employeeId: e.target.value})} className="col-span-3 h-8 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="staffContact" className="text-right text-xs">Contact</Label>
                    <Input id="staffContact" value={staffForm.contactNumber} onChange={(e) => setStaffForm({...staffForm, contactNumber: e.target.value})} className="col-span-3 h-8 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="baseSal" className="text-right text-xs">Base Salary</Label>
                    <Input id="baseSal" type="number" value={staffForm.baseSalary} onChange={(e) => setStaffForm({...staffForm, baseSalary: e.target.value})} className="col-span-3 h-8 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="staffRole" className="text-right text-xs">Role</Label>
                    <Select value={staffForm.role} onValueChange={(v: any) => setStaffForm({...staffForm, role: v})}>
                      <SelectTrigger className="col-span-3 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Other Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Staff Type</Label>
                    <Select value={staffForm.isTeaching ? 'teaching' : 'non-teaching'} onValueChange={(v) => setStaffForm({...staffForm, isTeaching: v === 'teaching'})}>
                      <SelectTrigger className="col-span-3 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">Teaching Staff</SelectItem>
                        <SelectItem value="non-teaching">Non-Teaching Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="loginId" className="text-right text-xs">Login ID</Label>
                    <Input id="loginId" value={staffForm.loginId} onChange={(e) => setStaffForm({...staffForm, loginId: e.target.value})} className="col-span-3 h-8 text-xs" placeholder="e.g. jameel_123" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pass" className="text-right text-xs">Password</Label>
                    <Input id="pass" type="password" value={staffForm.password} onChange={(e) => setStaffForm({...staffForm, password: e.target.value})} className="col-span-3 h-8 text-xs" placeholder="••••••••" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="qual" className="text-right text-xs">Qualification</Label>
                    <Input id="qual" value={staffForm.qualification} onChange={(e) => setStaffForm({...staffForm, qualification: e.target.value})} className="col-span-3 h-8 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assignClass" className="text-right text-xs">Assign Class</Label>
                    <Select value={staffForm.assignedClass} onValueChange={(v) => setStaffForm({...staffForm, assignedClass: v})}>
                      <SelectTrigger className="col-span-3 h-8 text-xs">
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Admin/Staff)</SelectItem>
                        {SCHOOL_CLASSES.map(c => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-accent h-8 text-xs w-full">Save Staff Member</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" onClick={() => handlePrintSalarySlips()} className="h-9 text-xs border-border">
              <Printer size={16} className="mr-1" /> Print All Slips (A4)
            </Button>
          )}
        </div>
      </div>

      {view === 'staff' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="bg-background border border-border shadow-none rounded-xl overflow-hidden hover:border-accent transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-2 ring-accent/10">
                    <AvatarFallback className="bg-accent text-white font-bold">{teacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-primary group-hover:text-accent transition-colors">{teacher.name}</h4>
                    <p className="text-[10px] text-accent font-extrabold uppercase tracking-widest">{teacher.designation}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employee ID:</span>
                    <span className="font-bold">{teacher.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-bold">{teacher.contactNumber}</span>
                  </div>
                  <div className="flex justify-between bg-emerald-50 p-2 rounded-md border border-emerald-100 mt-2">
                    <span className="text-emerald-700 font-medium">Base Salary:</span>
                    <span className="font-extrabold text-emerald-800">${teacher.baseSalary?.toLocaleString()}</span>
                  </div>
                </div>
                <Separator className="my-4 bg-border/50" />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-[11px] h-8 border-border hover:bg-accent hover:text-white"
                    onClick={() => {
                      setSelectedStaff(teacher);
                      setOpenPayroll(true);
                    }}
                  >
                    <DollarSign size={14} className="mr-1" /> Payroll
                  </Button>
                    <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-[11px] h-8 border-border hover:bg-accent hover:text-white"
                    onClick={() => {
                      setStaffForm({
                        name: teacher.name,
                        designation: teacher.designation,
                        employeeId: teacher.employeeId,
                        contactNumber: teacher.contactNumber,
                        baseSalary: teacher.baseSalary?.toString() || '',
                        qualification: teacher.qualification,
                        assignedClass: teacher.assignedClass || 'none',
                        loginId: teacher.loginId || '',
                        password: '', // Don't show existing password
                        role: teacher.role,
                        isTeaching: teacher.isTeaching ?? true
                      });
                      setSelectedStaff(teacher);
                    }}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border bg-white">
            <CardTitle className="text-lg font-bold">Payroll History</CardTitle>
            <CardDescription className="text-xs">Review generated payroll and print salary slips</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-left">
              <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Month/Year</th>
                  <th className="px-6 py-4">Base Salary</th>
                  <th className="px-6 py-4">Net Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payroll.map((p) => {
                  const staff = teachers.find(t => t.employeeId === p.employeeId);
                  return (
                    <tr key={p.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{staff?.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.employeeId}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{p.month} {p.year}</td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">${p.baseSalary.toLocaleString()}</td>
                      <td className="px-6 py-4 font-extrabold text-emerald-600">${p.netSalary.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Paid</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrintSalarySlips(p.employeeId)}
                          className="text-accent h-7 text-[11px] hover:bg-accent/10"
                        >
                          <Printer size={14} className="mr-1" /> Slip
                        </Button>
                      </td>
                    </tr>
                  )
                })}
                {payroll.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">No payroll records generated yet. Click 'Payroll' on a staff member to start.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Payroll Entry Dialog */}
      <Dialog open={openPayroll} onOpenChange={setOpenPayroll}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Generate Salary Slip</DialogTitle>
            <DialogDescription>
              Enter adjustments for {selectedStaff?.name}'s salary
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGeneratePayroll} className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Base Salary</Label>
              <Input value={`$${selectedStaff?.baseSalary}`} disabled className="col-span-3 h-9 text-xs bg-muted font-bold" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bonus" className="text-right text-xs">Bonus</Label>
              <Input id="bonus" type="number" value={payrollForm.bonus} onChange={(e) => setPayrollForm({...payrollForm, bonus: e.target.value})} className="col-span-3 h-9 text-xs" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deduct" className="text-right text-xs">Deductions</Label>
              <Input id="deduct" type="number" value={payrollForm.deductions} onChange={(e) => setPayrollForm({...payrollForm, deductions: e.target.value})} className="col-span-3 h-9 text-xs" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="month" className="text-right text-xs">Month</Label>
              <Select value={payrollForm.month} onValueChange={(v) => setPayrollForm({...payrollForm, month: v})}>
                <SelectTrigger className="col-span-3 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t border-border flex justify-between items-center text-sm">
              <span className="font-bold text-muted-foreground">Net Payable:</span>
              <span className="text-xl font-black text-emerald-600">
                ${(selectedStaff?.baseSalary || 0) + Number(payrollForm.bonus) - Number(payrollForm.deductions)}
              </span>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-primary w-full h-10 text-xs font-bold uppercase tracking-wider">Generate Slip & Finalize</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={!!selectedStaff && !openPayroll} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Profile</DialogTitle>
            <DialogDescription>Update the details for {selectedStaff?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStaff} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editName" className="text-right text-xs">Name</Label>
              <Input id="editName" value={staffForm.name} onChange={(e) => setStaffForm({...staffForm, name: e.target.value})} className="col-span-3 h-8 text-xs" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDesig" className="text-right text-xs">Designation</Label>
              <Input id="editDesig" value={staffForm.designation} onChange={(e) => setStaffForm({...staffForm, designation: e.target.value})} className="col-span-3 h-8 text-xs" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editEmpId" className="text-right text-xs">Employee ID</Label>
              <Input id="editEmpId" value={staffForm.employeeId} onChange={(e) => setStaffForm({...staffForm, employeeId: e.target.value})} className="col-span-3 h-8 text-xs" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editContact" className="text-right text-xs">Contact</Label>
              <Input id="editContact" value={staffForm.contactNumber} onChange={(e) => setStaffForm({...staffForm, contactNumber: e.target.value})} className="col-span-3 h-8 text-xs" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editSalary" className="text-right text-xs">Base Salary</Label>
              <Input id="editSalary" type="number" value={staffForm.baseSalary} onChange={(e) => setStaffForm({...staffForm, baseSalary: e.target.value})} className="col-span-3 h-8 text-xs" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editRole" className="text-right text-xs">Role</Label>
              <Select value={staffForm.role} onValueChange={(v: any) => setStaffForm({...staffForm, role: v})}>
                <SelectTrigger className="col-span-3 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Other Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Staff Type</Label>
              <Select value={staffForm.isTeaching ? 'teaching' : 'non-teaching'} onValueChange={(v) => setStaffForm({...staffForm, isTeaching: v === 'teaching'})}>
                <SelectTrigger className="col-span-3 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teaching">Teaching Staff</SelectItem>
                  <SelectItem value="non-teaching">Non-Teaching Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editLoginId" className="text-right text-xs">Login ID</Label>
              <Input id="editLoginId" value={staffForm.loginId} onChange={(e) => setStaffForm({...staffForm, loginId: e.target.value})} className="col-span-3 h-8 text-xs" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPass" className="text-right text-xs">New Password</Label>
              <Input id="editPass" type="password" value={staffForm.password} onChange={(e) => setStaffForm({...staffForm, password: e.target.value})} className="col-span-3 h-8 text-xs" placeholder="Leave empty to keep current" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editQual" className="text-right text-xs">Qualification</Label>
              <Input id="editQual" value={staffForm.qualification} onChange={(e) => setStaffForm({...staffForm, qualification: e.target.value})} className="col-span-3 h-8 text-xs" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs">Assign Class</Label>
              <Select value={staffForm.assignedClass} onValueChange={(v) => setStaffForm({...staffForm, assignedClass: v})}>
                <SelectTrigger className="col-span-3 h-8 text-xs">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Admin/Staff)</SelectItem>
                  {SCHOOL_CLASSES.map(c => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-accent h-8 text-xs w-full">Update Staff Member</Button>
            </DialogFooter>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Attendance Card */}
        <Card className="lg:col-span-2 border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border bg-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold">Daily Attendance</CardTitle>
                <CardDescription className="text-xs">Mark and track student attendance</CardDescription>
              </div>
              <div className="flex gap-4">
                <Input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40 h-9 text-xs border-border" 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Parent Notification</th>
                    <th className="px-6 py-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => {
                    const att = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
                    return (
                      <tr key={student.id} className="hover:bg-background transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{student.name}</div>
                          <div className="text-[10px] text-muted-foreground">Roll: {student.rollNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant={att?.status === 'present' ? 'default' : 'outline'}
                              onClick={() => onMarkAttendance(student.id, 'present')}
                              className={`h-7 w-7 p-0 text-[10px] font-bold ${att?.status === 'present' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-border'}`}
                            >P</Button>
                            <Button 
                              size="sm" 
                              variant={att?.status === 'absent' ? 'destructive' : 'outline'}
                              onClick={() => onMarkAttendance(student.id, 'absent')}
                              className={`h-7 w-7 p-0 text-[10px] font-bold ${att?.status === 'absent' ? 'bg-red-500 hover:bg-red-600' : 'border-border'}`}
                            >A</Button>
                            <Button 
                              size="sm" 
                              variant={att?.status === 'late' ? 'default' : 'outline'}
                              onClick={() => onMarkAttendance(student.id, 'late')}
                              className={`h-7 w-7 p-0 text-[10px] font-bold ${att?.status === 'late' ? 'bg-amber-500 hover:bg-amber-600' : 'border-border'}`}
                            >L</Button>
                            <Button 
                              size="sm" 
                              variant={att?.status === 'leave' ? 'default' : 'outline'}
                              onClick={() => onMarkAttendance(student.id, 'leave')}
                              className={`h-7 w-7 p-0 text-[10px] font-bold ${att?.status === 'leave' ? 'bg-blue-500 hover:bg-blue-600' : 'border-border'}`}
                            >LV</Button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(att?.status === 'absent' || att?.status === 'late') ? (
                            <a 
                              href={getWhatsAppLink(student, att.status)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-emerald-200 transition-colors"
                            >
                              <MessageCircle size={12} /> Notify Parent
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic text-[10px]">No action required</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Input placeholder="Add note..." className="h-7 text-[10px] border-border max-w-[120px]" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Star of the Month Sidebar */}
        <div className="space-y-6">
          <Card className="border border-border shadow-none rounded-xl bg-gradient-to-br from-amber-50 to-white overflow-hidden">
            <CardHeader className="bg-amber-500/10 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-500" size={20} />
                <CardTitle className="text-base font-bold text-amber-900">Star of the Month</CardTitle>
              </div>
              <CardDescription className="text-xs text-amber-700 font-medium">Perfect attendance for {new Date().toLocaleString('default', { month: 'long' })}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[400px] pr-4">
                {starStudents.length > 0 ? (
                  <div className="space-y-3">
                    {starStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8 border-2 border-amber-200">
                              <AvatarFallback className="bg-amber-50 text-amber-700 text-[10px] font-bold">{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full h-3 w-3 flex items-center justify-center border border-white">
                              <Star size={8} className="text-white" fill="currentColor" />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-xs text-amber-900 leading-none">{student.name}</div>
                            <div className="text-[10px] text-amber-600 mt-1">Grade: {student.grade} - {student.section}</div>
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[9px]">Star</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4 italic text-muted-foreground text-xs space-y-2">
                    <Star className="text-amber-200" size={32} />
                    <p>No perfect attendance records found for this month yet.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-none rounded-xl bg-white">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-bold">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                  <div className="text-xl font-bold text-emerald-700">
                    {attendance.filter(a => a.date === selectedDate && a.status === 'present').length}
                  </div>
                  <div className="text-[9px] font-bold text-emerald-600 uppercase">Present</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                  <div className="text-xl font-bold text-red-700">
                    {attendance.filter(a => a.date === selectedDate && a.status === 'absent').length}
                  </div>
                  <div className="text-[9px] font-bold text-red-600 uppercase">Absent</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                  <div className="text-xl font-bold text-amber-700">
                    {attendance.filter(a => a.date === selectedDate && a.status === 'late').length}
                  </div>
                  <div className="text-[9px] font-bold text-amber-600 uppercase">Late</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                  <div className="text-xl font-bold text-blue-700">
                    {attendance.filter(a => a.date === selectedDate && a.status === 'leave').length}
                  </div>
                  <div className="text-[9px] font-bold text-blue-600 uppercase">Leave</div>
                </div>
              </div>
            </CardContent>
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
  onRecordFee,
  onSaveChallans,
  onDeleteChallan,
  onUpdateChallan
}: { 
  students: Student[], 
  feeRecords: FeeRecord[], 
  feeChallans: FeeChallan[],
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
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'challans'>('all');
  const [challanSearch, setChallanSearch] = useState('');
  
  const [feeForm, setFeeForm] = useState({
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
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
      const isPaid = feeRecords.some(r => 
        r.studentId === s.id && 
        r.month === currentMonth && 
        r.year === currentYear && 
        r.status === 'paid'
      );
      return !isPaid;
    });
  }, [students, feeRecords]);

  const totalPending = pendingStudents.reduce((sum, s) => sum + s.monthlyFee, 0);

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
              <h2 style="margin: 0; font-size: 14px; text-transform: uppercase; font-weight: 900;">Al-Naseeha High School</h2>
              <p style="margin: 0; font-size: 9px; font-weight: bold; color: #666;">Chiniot, Punjab, Pakistan</p>
            </div>
          </div>
          <p style="margin: 2px 0; font-size: 9px; font-weight: bold; color: #666;">Contact: 0300-1234567 | Session: 2023-24</p>
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
          <tr><td style="border: 1px solid #000; padding: 4px;">Tuition Fee</td><td style="border: 1px solid #000; padding: 4px; text-align: right;">Rs.${challan.monthlyFee?.toLocaleString()}</td></tr>
          <tr>
            <td style="border: 1px solid #000; padding: 4px;">
              <strong>Arrears / Previous Dues</strong>
              ${challan.arrearsDescription ? `<br><small style="color:#666;">(${challan.arrearsDescription})</small>` : ''}
            </td>
            <td style="border: 1px solid #000; padding: 4px; text-align: right;">Rs.${challan.arrears?.toLocaleString()}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 11px;"><td style="border: 1px solid #000; padding: 4px; background: #f0f0f0;">Total Payable</td><td style="border: 1px solid #000; padding: 4px; text-align: right; background: #f0f0f0;">Rs.${challan.totalPayable?.toLocaleString()}</td></tr>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border shadow-none rounded-xl bg-primary text-white">
          <CardContent className="p-6">
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1">Total Monthly Demand</p>
            <h3 className="text-3xl font-bold">Rs.{students.reduce((sum, s) => sum + s.monthlyFee, 0).toLocaleString()}</h3>
            <p className="text-emerald-400 text-[11px] font-bold mt-2">Active Student Fees</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none rounded-xl bg-white">
          <CardContent className="p-6">
            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1">Pending Amount</p>
            <h3 className="text-3xl font-bold text-red-600 font-black tracking-tighter">Rs.{totalPending.toLocaleString()}</h3>
            <p className="text-red-500 text-[11px] font-bold mt-2">{pendingStudents.length} Students Remaining</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none rounded-xl bg-white">
          <CardContent className="p-6">
            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1">Generated Challans</p>
            <h3 className="text-3xl font-bold text-primary">{feeChallans.length}</h3>
            <p className="text-emerald-600 text-[11px] font-bold mt-2">Active Inventory</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex bg-muted p-1 rounded-lg w-fit no-print">
        <Button 
          variant={activeTab === 'all' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('all')}
          className="text-xs h-8 px-4"
        >All Students</Button>
        <Button 
          variant={activeTab === 'pending' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('pending')}
          className="text-xs h-8 px-4"
        >Pending Dues ({pendingStudents.length})</Button>
        <Button 
          variant={activeTab === 'challans' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('challans')}
          className="text-xs h-8 px-4"
        >Challan Management</Button>
      </div>

      {activeTab !== 'challans' ? (
      <Card className="border border-border shadow-none rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-white no-print">
          <div>
            <CardTitle className="text-lg font-bold truncate max-w-[200px] sm:max-w-none">Fee Management Portfolio</CardTitle>
            <CardDescription className="text-xs">
              {activeTab === 'all' ? 'Viewing all registered students' : 'List of students with pending fees'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                const currentMonth = new Date().toLocaleString('default', { month: 'long' });
                const currentYear = new Date().getFullYear();
                const total = pendingStudents.reduce((sum, student) => sum + student.monthlyFee + (student.arrears || 0), 0);
                alert(`Total Pending Demand for ${currentMonth}: Rs.${total.toLocaleString()}`);
              }}
              className="h-9 text-xs border-red-200 text-red-600 font-bold"
            >
              Defaulters Total
            </Button>
            <Button 
              onClick={generateBulkChallansAction} 
              className="bg-accent hover:bg-accent/90 text-white h-9 text-xs"
            >
              <Printer size={16} className="mr-2" /> Bulk Generate Challans
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Monthly Fee</th>
                  <th className="px-6 py-4">Dues Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayList.map((student) => {
                  const currentMonthPaid = feeRecords.find(r => 
                    r.studentId === student.id && 
                    r.month === new Date().toLocaleString('default', { month: 'long' }) &&
                    r.year === new Date().getFullYear()
                  );
                  
                  return (
                    <tr key={student.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">
                        {student.name}
                        <div className="text-[10px] text-muted-foreground font-normal">Grade: {student.grade} - {student.section}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{student.rollNumber}</td>
                      <td className="px-6 py-4 text-muted-foreground font-bold">Rs.{student.monthlyFee.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge className={currentMonthPaid ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                          {currentMonthPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedStudent(student);
                              setFeeForm({ ...feeForm, amount: student.monthlyFee.toString() });
                              setOpenRecord(true);
                            }}
                            className="text-emerald-600 hover:text-white hover:bg-emerald-600 border-emerald-200 h-7 text-[10px] font-bold"
                          >Record Fee</Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedStudent(student);
                              setOpenLedger(true);
                            }}
                            className="text-primary hover:text-white hover:bg-primary border-primary/20 h-7 text-[10px] font-bold"
                          >Ledger</Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const currentMonth = new Date().toLocaleString('default', { month: 'long' });
                              const currentYear = new Date().getFullYear();
                              const issueDate = new Date().toISOString().split('T')[0];
                              const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0];
                              const c: FeeChallan = {
                                id: `CH-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                                studentId: student.id,
                                month: currentMonth,
                                year: currentYear,
                                monthlyFee: student.monthlyFee,
                                arrears: student.arrears || 0,
                                arrearsDescription: student.arrearsDescription,
                                totalPayable: student.monthlyFee + (student.arrears || 0),
                                issueDate,
                                dueDate,
                                status: 'issued'
                              };
                              onSaveChallans([c]);
                              setActiveTab('challans');
                            }}
                            className="text-muted-foreground h-7 text-[10px]"
                          ><Printer size={14} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      ) : (
        <Card className="border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-white">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold underline decoration-accent">Generated Challans Repo</CardTitle>
              <CardDescription className="text-xs italic">Manage issued challans for individual/bulk printing</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search student or ID..." 
                className="pl-9 h-9 text-xs"
                value={challanSearch}
                onChange={(e) => setChallanSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Challan ID</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredChallans.length > 0 ? filteredChallans.map((challan) => {
                    const student = students.find(s => s.id === challan.studentId);
                    return (
                      <tr key={challan.id} className="hover:bg-background transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-accent">{challan.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold">{student?.name || 'Unknown'}</div>
                          <div className="text-[10px] text-muted-foreground">Class: {student?.grade}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{challan.month} {challan.year}</td>
                        <td className="px-6 py-4 font-black">Rs.{challan.totalPayable.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`${
                            challan.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            challan.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          } text-[10px] uppercase font-bold`}>
                            {challan.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-primary" 
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
                    <p><strong>Monthly:</strong> Rs.{selectedStudent?.monthlyFee.toLocaleString()}</p>
                    <p><strong>Arrears:</strong> Rs.{selectedStudent?.arrears?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Paid Count</p>
                  <p className="text-xl font-black text-emerald-800">{studentLedger.length}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold text-red-700 uppercase">Arrears Dues</p>
                  <p className="text-lg font-black text-red-800">Rs.{selectedStudent?.arrears?.toLocaleString() || '0'}</p>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48 h-10 border-accent text-accent font-bold">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {SCHOOL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => setShowConfig(true)}
            className="border-primary text-primary hover:bg-primary/5 h-10 text-xs font-bold"
          >
            <Settings size={16} className="mr-2" /> Configure Slots
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="border-primary text-primary h-10 text-xs font-bold"
          >
            <Printer size={16} className="mr-2" /> Print Timetable
          </Button>
        </div>
      </div>

      <Card className="border border-border shadow-none rounded-xl overflow-hidden print:border-none print:shadow-none">
        <CardHeader className="bg-white border-b print:pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-black">{selectedClass} Timetable</CardTitle>
              <CardDescription className="text-xs">Weekly academic schedule and teacher assignments</CardDescription>
            </div>
            <div className="hidden print:block text-right">
              <img src={SCHOOL_LOGO} alt="School Logo" className="h-10 ml-auto mb-1" referrerPolicy="no-referrer" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Academic Session 2026-27</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {slots.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                <CalendarCheck size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">No Time Slots Configured</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">Please configure your school timings and period structure to generate the timetable grid.</p>
                <Button onClick={() => setShowConfig(true)} className="bg-primary text-white mt-4">Setup Now</Button>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-r bg-muted/30 p-4 text-[10px] font-black uppercase text-muted-foreground w-32">Time / Period</th>
                  {DAYS.map(day => (
                    <th key={day} className="border-b border-r bg-muted/30 p-4 text-[10px] font-black uppercase text-muted-foreground text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id} className={slot.isBreak ? 'bg-amber-50/50' : ''}>
                    <td className="border-b border-r p-3 text-center">
                      <p className="text-[10px] font-black uppercase tracking-wider text-primary">{slot.label}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{slot.startTime} - {slot.endTime}</p>
                    </td>
                    {DAYS.map(day => {
                      const entry = currentEntry(day, slot.id);
                      const teacher = teachers.find(t => t.id === entry?.teacherId);
                      
                      if (slot.isBreak) {
                        return (
                          <td key={day} className="border-b border-r p-3 bg-amber-50/30">
                            {day === 'Monday' && (
                              <div className="h-full flex items-center justify-center">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/50 transform -rotate-0">R E C E S S</span>
                              </div>
                            )}
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={day} 
                          className="border-b border-r p-1 hover:bg-accent/5 transition-colors cursor-pointer group relative h-20"
                          onClick={() => !slot.isBreak && setEditingEntry({ day, slotId: slot.id })}
                        >
                          {entry ? (
                            <div className="h-full w-full p-2 flex flex-col justify-center items-center text-center space-y-1">
                              <p className="text-[11px] font-bold text-foreground leading-tight">{entry.subject}</p>
                              <p className="text-[9px] text-muted-foreground font-medium truncate w-full">{teacher?.name || 'Unknown'}</p>
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                <Edit size={10} className="text-primary" />
                              </div>
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity no-print">
                              <Plus size={14} className="text-muted-foreground/30" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Entry Assignment Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Class Period</DialogTitle>
            <DialogDescription>
              Assigning {editingEntry?.day} Period {slots.find(s => s.id === editingEntry?.slotId)?.label} for {selectedClass}
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAssign(formData.get('subject') as string, formData.get('teacherId') as string);
            }} 
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label className="text-xs">Subject Name</Label>
              <Input 
                name="subject" 
                placeholder="e.g. Mathematics" 
                defaultValue={currentEntry(editingEntry?.day || '', editingEntry?.slotId || '')?.subject || ''}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Select Teacher</Label>
              <Select name="teacherId" defaultValue={currentEntry(editingEntry?.day || '', editingEntry?.slotId || '')?.teacherId || ''} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chose Staff Member" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.subject || t.designation})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingEntry(null)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-white">Save Assignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Timetable Configuration</DialogTitle>
            <DialogDescription>Define your school's daily period structure.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs">School Start Time</Label>
              <Input 
                type="time" 
                value={configForm.startTime} 
                onChange={e => setConfigForm({...configForm, startTime: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Period Duration (mins)</Label>
              <Input 
                type="number" 
                value={configForm.duration} 
                onChange={e => setConfigForm({...configForm, duration: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Number of Periods</Label>
              <Input 
                type="number" 
                value={configForm.periods} 
                onChange={e => setConfigForm({...configForm, periods: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Break After Period #</Label>
              <Input 
                type="number" 
                value={configForm.breakAfter} 
                onChange={e => setConfigForm({...configForm, breakAfter: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Break Duration (mins)</Label>
              <Input 
                type="number" 
                value={configForm.breakDuration} 
                onChange={e => setConfigForm({...configForm, breakDuration: Number(e.target.value)})} 
              />
            </div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
             <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
               <span className="block mb-1 font-black">WARNING:</span>
               Regenerating slots will update the structure for ALL classes. Existing assignments will persist if slot IDs match, but new slots may appear differently.
             </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfig(false)}>Cancel</Button>
            <Button onClick={generateSlots} className="bg-primary text-white font-black">Generate Grid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExamsView({ students }: { students: Student[] }) {
  return (
    <Card className="border border-border shadow-none rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-white">
        <div>
          <CardTitle className="text-lg font-bold">Examination Results</CardTitle>
          <CardDescription className="text-xs">View and manage student academic performance</CardDescription>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white h-9 text-xs">
          <Plus size={16} className="mr-2" /> New Exam
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input placeholder="Search student..." className="max-w-xs h-9 text-xs border-border" />
            <Select defaultValue="midterm">
              <SelectTrigger className="w-[180px] h-9 text-xs border-border">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="midterm">Mid-Term 2024</SelectItem>
                <SelectItem value="final">Final Exam 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-background transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">Ali Khan</td>
                  <td className="px-6 py-4 text-muted-foreground">Mathematics</td>
                  <td className="px-6 py-4 text-muted-foreground">85/100</td>
                  <td className="px-6 py-4 font-extrabold text-emerald-600">A</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Pass</span></td>
                </tr>
                <tr className="hover:bg-background transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">Sara Ahmed</td>
                  <td className="px-6 py-4 text-muted-foreground">Mathematics</td>
                  <td className="px-6 py-4 text-muted-foreground">92/100</td>
                  <td className="px-6 py-4 font-extrabold text-emerald-600">A+</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Pass</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      <Card className="border-none shadow-none rounded-xl bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
          <div>
            <CardTitle className="text-xl font-black">Daily Cashbook</CardTitle>
            <CardDescription className="text-xs">Real-time tracking of daily cash flow</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-xs font-bold">Select Date:</Label>
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 w-40 text-xs"
            />
            <Button variant="outline" size="sm" onClick={() => window.print()} className="h-9 text-xs border-primary text-primary">
              <Printer size={16} className="mr-2" /> Print Day Sheet
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border">
            <div className="p-6 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Cash Inward</p>
              <h3 className="text-2xl font-black text-emerald-600">Rs.{totalIn.toLocaleString()}</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Cash Outward</p>
              <h3 className="text-2xl font-black text-rose-600">Rs.{totalOut.toLocaleString()}</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Closing Balance</p>
              <h3 className={`text-2xl font-black ${netCash >= 0 ? 'text-primary' : 'text-red-700'}`}>
                Rs.{netCash.toLocaleString()}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash In Table */}
        <Card className="border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="bg-emerald-50/50 border-b">
            <CardTitle className="text-sm font-black text-emerald-800 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4" /> CASSH IN (INCOME)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 font-bold border-b">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dailyTransactions.filter(t => t.type === 'income').map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-bold">{t.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.description}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600">Rs.{t.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {dailyInvoices.filter(i => i.type === 'sale').map(i => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 font-bold">Inventory Sale</td>
                    <td className="px-4 py-3 text-muted-foreground">Invoice: {i.id}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600">Rs.{i.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {dailyTransactions.filter(t => t.type === 'income').length === 0 && dailyInvoices.filter(i => i.type === 'sale').length === 0 && (
                   <tr><td colSpan={3} className="p-6 text-center italic text-muted-foreground">No income recorded today</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Cash Out Table */}
        <Card className="border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="bg-rose-50/50 border-b">
            <CardTitle className="text-sm font-black text-rose-800 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" /> CASH OUT (EXPENSE)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 font-bold border-b">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dailyTransactions.filter(t => t.type === 'expense').map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-bold">{t.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.description}</td>
                    <td className="px-4 py-3 text-right font-black text-rose-600">Rs.{t.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {dailyInvoices.filter(i => i.type === 'purchase').map(i => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 font-bold">Inventory Purchase</td>
                    <td className="px-4 py-3 text-muted-foreground">Invoice: {i.id}</td>
                    <td className="px-4 py-3 text-right font-black text-rose-600">Rs.{i.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {dailyTransactions.filter(t => t.type === 'expense').length === 0 && dailyInvoices.filter(i => i.type === 'purchase').length === 0 && (
                   <tr><td colSpan={3} className="p-6 text-center italic text-muted-foreground">No expense recorded today</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
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

  const getBreakout = () => {
    const breakout: { [key: string]: number } = {};
    transactions.forEach(t => {
      const key = `${t.type}:${t.category}`;
      breakout[key] = (breakout[key] || 0) + t.amount;
    });
    return breakout;
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
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-box { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th, .table td { border: 1px solid #eee; padding: 12px; text-align: left; }
            .table th { background: #f9fafb; font-weight: bold; }
            .profit { color: #10b981; font-weight: bold; }
            .loss { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body onload="window.print();">
          <div class="header">
            <h1 style="margin:0;">Al-Naseeha High School</h1>
            <p style="margin:5px 0; color:#666;">Monthly Financial Balance Sheet</p>
            <p style="font-weight:bold;">${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
          
          <div class="summary">
            <div class="stat-box">
              <p style="font-size:12px; margin:0; text-transform:uppercase; color:#666;">Total Income</p>
              <h2 class="income">Rs.${totalIncome.toLocaleString()}</h2>
            </div>
            <div class="stat-box">
              <p style="font-size:12px; margin:0; text-transform:uppercase; color:#666;">Total Expense</p>
              <h2 class="expense">Rs.${totalExpense.toLocaleString()}</h2>
            </div>
            <div class="stat-box">
              <p style="font-size:12px; margin:0; text-transform:uppercase; color:#666;">Net ${netProfit >= 0 ? 'Profit' : 'Loss'}</p>
              <h2 class="${netProfit >= 0 ? 'profit' : 'loss'}">Rs.${Math.abs(netProfit).toLocaleString()}</h2>
            </div>
          </div>

          <h3>Income Breakdown</h3>
          <table class="table">
            <thead><tr><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              ${incomeCategories.map(cat => `
                <tr>
                  <td>${cat}</td>
                  <td>Rs.${(breakout[`income:${cat}`] || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>Expense Breakdown</h3>
          <table class="table">
            <thead><tr><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              ${expenseCategories.map(cat => `
                <tr>
                  <td>${cat}</td>
                  <td>Rs.${(breakout[`expense:${cat}`] || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-600 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-white/20 p-2 rounded-lg"><TrendingUp size={20} /></div>
              <ArrowUpRight size={20} className="text-white/60" />
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Total Income</p>
            <h3 className="text-2xl font-black">Rs.{totalIncome.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-rose-600 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-white/20 p-2 rounded-lg"><TrendingDown size={20} /></div>
              <ArrowDownRight size={20} className="text-white/60" />
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Total Expense</p>
            <h3 className="text-2xl font-black">Rs.{totalExpense.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className={`border-none shadow-lg text-white ${netProfit >= 0 ? 'bg-primary' : 'bg-red-700'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-white/20 p-2 rounded-lg font-black">{netProfit >= 0 ? 'PROFIT' : 'LOSS'}</div>
              <DollarSign size={20} className="text-white/60" />
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Net Balance</p>
            <h3 className="text-2xl font-black">Rs.{Math.abs(netProfit).toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="flex bg-muted p-1 rounded-lg w-fit">
        <Button 
          variant={activeTab === 'transactions' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('transactions')}
          className="text-xs h-8 px-4"
        >Transactions</Button>
        <Button 
          variant={activeTab === 'balancesheet' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('balancesheet')}
          className="text-xs h-8 px-4"
        >Balance Sheet</Button>
      </div>

      {activeTab === 'transactions' ? (
        <Card className="border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-white">
            <div className="flex-1">
              <CardTitle className="text-lg font-black">Financial Transactions</CardTitle>
              <CardDescription className="text-xs">Record and track all cash flows</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions or students..." 
                  className="pl-9 h-9 text-xs"
                  value={financeSearch}
                  onChange={(e) => setFinanceSearch(e.target.value)}
                />
              </div>
              <Button onClick={() => setOpenAdd(true)} className="bg-primary hover:bg-primary/90 text-white h-9 text-xs font-bold">
                <Plus size={16} className="mr-2" /> Add Record
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.length > 0 ? [...filteredTransactions].reverse().map((t) => (
                    <tr key={t.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">{t.date}</td>
                      <td className="px-6 py-4">
                        <Badge className={`${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} border-none uppercase text-[9px] font-black tracking-tighter`}>
                          {t.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold">{t.category}</td>
                      <td className="px-6 py-4">
                        {t.description}
                        {t.studentId && (
                          <div className="text-[10px] text-muted-foreground italic">Student: {students.find(s => s.id === t.studentId)?.name}</div>
                        )}
                      </td>
                      <td className={`px-6 py-4 font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'income' ? '+' : '-'}Rs.{t.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" onClick={() => onDeleteTransaction(t.id)} className="text-red-500 hover:text-red-700 h-7 w-7 p-0">
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-10 text-center italic text-muted-foreground">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-white">
            <div>
              <CardTitle className="text-lg font-black">Monthly Balance Sheet</CardTitle>
              <CardDescription className="text-xs">Consolidated financial report</CardDescription>
            </div>
            <Button onClick={printBalanceSheet} variant="outline" className="h-9 text-xs border-primary text-primary font-bold">
              <Printer size={16} className="mr-2" /> Print Balance Sheet
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-black text-emerald-700 border-b-2 border-emerald-100 pb-2">INCOME BREAKOUT</h4>
                <div className="space-y-2">
                  {incomeCategories.map(cat => {
                    const amount = transactions.filter(t => t.type === 'income' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
                    return (
                      <div key={cat} className="flex justify-between items-center text-xs p-2 bg-emerald-50/50 rounded-lg">
                        <span className="font-bold">{cat}</span>
                        <span className="font-black text-emerald-600">Rs.{amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-black text-rose-700 border-b-2 border-rose-100 pb-2">EXPENSE BREAKOUT</h4>
                <div className="space-y-2">
                  {expenseCategories.map(cat => {
                    const amount = transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
                    return (
                      <div key={cat} className="flex justify-between items-center text-xs p-2 bg-rose-50/50 rounded-lg">
                        <span className="font-bold">{cat}</span>
                        <span className="font-black text-rose-600">Rs.{amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Transaction Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Record Transaction</DialogTitle>
            <DialogDescription>Add a new income or expense entry</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v: TransactionType) => setFormData({
                    ...formData, 
                    type: v, 
                    category: v === 'income' ? incomeCategories[0] : expenseCategories[0]
                  })}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income (+)</SelectItem>
                    <SelectItem value="expense">Expense (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v: any) => setFormData({...formData, category: v})}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {formData.type === 'income' ? (
                      incomeCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)
                    ) : (
                      expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.category === 'Admission' || formData.category === 'Yearly Charges' || formData.category === 'Tuition Fee') && (
              <div className="space-y-2">
                <Label className="text-xs">Select Student</Label>
                <Select value={formData.studentId} onValueChange={(v) => setFormData({...formData, studentId: v})}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select a student..." /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNumber})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Amount (PKR)</Label>
                <Input 
                  type="number" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  className="h-9 text-xs" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Date</Label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  className="h-9 text-xs" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="e.g. Admission fee for new intake..."
                className="h-9 text-xs" 
                required 
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)} className="h-10 text-xs">Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 h-10 text-xs font-black">Save Transaction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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

  const filteredInvoices = invoices.filter(inv => {
    if (invoiceTypeFilter === 'all') return true;
    return inv.type === invoiceTypeFilter;
  });

  const purchaseTotal = invoices.filter(i => i.type === 'purchase').reduce((sum, i) => sum + i.totalAmount, 0);
  const saleTotal = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalAmount, 0);
  const grossProfit = saleTotal - purchaseTotal;

  // Vendor Ledger Logic
  const vendorData = vendors.find(v => v.name === selectedVendor);
  const vendorTransactions = useMemo(() => {
    if (!selectedVendor) return [];
    const purchases = invoices.filter(i => i.type === 'purchase' && i.vendorName === selectedVendor);
    const payments = vendorPayments.filter(p => p.vendorName === selectedVendor);
    
    return [
      ...purchases.map(p => ({ date: p.date, description: `Invoice #${p.id}`, debit: p.totalAmount, credit: 0 })),
      ...payments.map(p => ({ date: p.date, description: p.description, debit: 0, credit: p.amount }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedVendor, invoices, vendorPayments]);

  const vendorBalance = useMemo(() => {
    if (!vendorData) return 0;
    const totalPurchase = vendorTransactions.reduce((sum, t) => sum + t.debit, 0);
    const totalPaid = vendorTransactions.reduce((sum, t) => sum + t.credit, 0);
    return vendorData.openingBalance + totalPurchase - totalPaid;
  }, [vendorData, vendorTransactions]);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    const payment: VendorPayment = {
      id: `VP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      vendorName: selectedVendor,
      amount: Number(paymentForm.amount),
      date: paymentForm.date,
      description: paymentForm.description
    };
    onAddVendorPayment(payment);
    setShowAddPayment(false);
    setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor: Vendor = {
      id: `VND-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name: newVendorForm.name,
      contact: newVendorForm.contact,
      address: newVendorForm.address,
      openingBalance: Number(newVendorForm.openingBalance || 0)
    };
    onAddVendor(vendor);
    setShowAddVendor(false);
    setNewVendorForm({ name: '', contact: '', address: '', openingBalance: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-muted p-1 rounded-lg w-fit no-print">
        <Button variant={activeTab === 'stock' ? 'default' : 'ghost'} onClick={() => setActiveTab('stock')} className="text-xs h-8 px-4">Stock Repo</Button>
        <Button variant={activeTab === 'purchase' ? 'default' : 'ghost'} onClick={() => setActiveTab('purchase')} className="text-xs h-8 px-4">New Purchase</Button>
        <Button variant={activeTab === 'sale' ? 'default' : 'ghost'} onClick={() => setActiveTab('sale')} className="text-xs h-8 px-4">New Sale</Button>
        <Button variant={activeTab === 'history' ? 'default' : 'ghost'} onClick={() => setActiveTab('history')} className="text-xs h-8 px-4">Invoice Logs</Button>
        <Button variant={activeTab === 'vendorledger' ? 'default' : 'ghost'} onClick={() => setActiveTab('vendorledger')} className="text-xs h-8 px-4">Vendor Ledger</Button>
        <Button variant={activeTab === 'report' ? 'default' : 'ghost'} onClick={() => setActiveTab('report')} className="text-xs h-8 px-4">Balance Sheet</Button>
      </div>

      {activeTab === 'stock' && (
        <Card className="border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg font-black">Inventory Stock Repository</CardTitle>
            <CardDescription className="text-xs">Real-time counts for books, stationery and uniforms</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Purchase Price</th>
                    <th className="px-6 py-4">Sale Price</th>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 font-bold">{item.name}</td>
                      <td className="px-6 py-4">{item.category}</td>
                      <td className="px-6 py-4">Rs.{item.purchasePrice}</td>
                      <td className="px-6 py-4">Rs.{item.salePrice}</td>
                      <td className="px-6 py-4 font-black">{item.stockQuantity} Units</td>
                      <td className="px-6 py-4">
                        <Badge className={item.stockQuantity < 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
                          {item.stockQuantity < 10 ? 'Low Stock' : 'Available'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {(activeTab === 'purchase' || activeTab === 'sale') && (
        <Card className="border border-border shadow-none rounded-xl overflow-hidden max-w-4xl">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg font-black">{activeTab === 'purchase' ? 'Create Purchase Invoice' : 'Create Sale Invoice'}</CardTitle>
            <CardDescription className="text-xs">
              {activeTab === 'purchase' ? 'Record stock arrival from vendors' : 'Issue items to students'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Transaction Date</Label>
                  <Input 
                    type="date" 
                    value={invoiceForm.date} 
                    onChange={(e) => setInvoiceForm({...invoiceForm, date: e.target.value})} 
                    className="h-9 text-xs" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold">{activeTab === 'purchase' ? 'Vendor / Supplier Name' : 'Select Student'}</Label>
                  <div className="flex gap-2">
                    {activeTab === 'purchase' ? (
                       <div className="flex-1">
                          <SearchableSelect 
                            items={vendors.map(v => ({ id: v.name, name: v.name }))} 
                            value={invoiceForm.vendorName} 
                            onSelect={(_, name) => setInvoiceForm({...invoiceForm, vendorName: name})} 
                            placeholder="Search or Enter Vendor..." 
                            isManual={true}
                          />
                       </div>
                    ) : (
                      <Select value={invoiceForm.studentId} onValueChange={(v) => setInvoiceForm({...invoiceForm, studentId: v})}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Search student..." /></SelectTrigger>
                        <SelectContent>
                          {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNumber})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    {activeTab === 'purchase' && (
                       <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 border-primary text-primary" onClick={() => setShowAddVendor(true)} title="Add New Vendor">
                         <Plus size={16} />
                       </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Invoice Items</h4>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddRow} className="h-7 text-[10px] border-primary text-primary font-bold"><Plus size={12} className="mr-1" /> Add Item Row</Button>
                </div>
                <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                  {invoiceForm.items.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-4 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Select Item</Label>
                        <SearchableSelect 
                          items={inventory.map(i => ({ id: i.id, name: i.name }))} 
                          value={row.inventoryItemId || row.name} 
                          onSelect={(id, name) => handleItemChange(idx, 'inventoryItemId', id, name)} 
                          placeholder="Search Item..." 
                          isManual={true}
                        />
                      </div>
                      <div className="col-span-1.5 space-y-1">
                        <Label className="text-[10px] text-muted-foreground text-center block">Qty</Label>
                        <Input type="number" value={row.quantity} onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} className="h-8 text-[10px] text-center" />
                      </div>
                      <div className="col-span-2.5 space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Unit Price</Label>
                        <Input type="number" value={row.unitPrice} onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))} className="h-8 text-[10px]" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] text-muted-foreground text-center block">Disc %</Label>
                        <Input type="number" value={row.discount} onChange={(e) => handleItemChange(idx, 'discount', Number(e.target.value))} className="h-8 text-[10px] text-center" placeholder="0" />
                      </div>
                      <div className="col-span-2 pb-1 text-right">
                         <div className="text-[10px] font-black text-primary truncate">Rs.{(row.quantity * row.unitPrice * (1 - (row.discount || 0) / 100)).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/50 rounded-xl">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold">Extra Expenses (Fare/Freight)</Label>
                    <Input type="number" value={invoiceForm.extraExpense} onChange={(e) => setInvoiceForm({...invoiceForm, extraExpense: e.target.value})} className="h-9 text-xs" placeholder="0" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold">Expense Detail</Label>
                    <Input value={invoiceForm.extraExpenseReason} onChange={(e) => setInvoiceForm({...invoiceForm, extraExpenseReason: e.target.value})} className="h-9 text-xs" placeholder="e.g. Rikshaw fare" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-red-600">Special Discount (Flat Amount)</Label>
                    <Input type="number" value={invoiceForm.specialDiscount} onChange={(e) => setInvoiceForm({...invoiceForm, specialDiscount: e.target.value})} className="h-9 text-xs border-red-200" placeholder="0" />
                 </div>
              </div>

              {activeTab === 'sale' && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Payment Settlement</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold">Amount Received</Label>
                      <Input 
                        type="number" 
                        value={invoiceForm.amountPaid} 
                        onChange={(e) => setInvoiceForm({...invoiceForm, amountPaid: e.target.value})} 
                        className="h-9 text-xs border-emerald-200"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2 pt-6">
                       <p className="text-[11px] text-emerald-700 italic">
                         Enter the amount paid by the student. {Number(invoiceForm.amountPaid) < calculateTotal() ? 'The balance will be saved as Credit.' : 'Payment is full.'}
                       </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t font-black">
                <div className="text-xl">Grand Total: <span className="text-primary">Rs.{calculateTotal().toLocaleString()}</span></div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white h-11 px-8 text-sm font-black transition-all">Generate & Post Invoice</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card className="border border-border shadow-none rounded-xl overflow-hidden">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black">Invoice Logs Repository</CardTitle>
              <CardDescription className="text-xs">Comprehensive history of all stock movements</CardDescription>
            </div>
            <div className="flex gap-4">
               <div className="flex bg-muted p-1 rounded-lg">
                  <Button variant={invoiceTypeFilter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setInvoiceTypeFilter('all')} className="h-7 text-[10px]">All</Button>
                  <Button variant={invoiceTypeFilter === 'purchase' ? 'secondary' : 'ghost'} size="sm" onClick={() => setInvoiceTypeFilter('purchase')} className="h-7 text-[10px]">Purchases</Button>
                  <Button variant={invoiceTypeFilter === 'sale' ? 'secondary' : 'ghost'} size="sm" onClick={() => setInvoiceTypeFilter('sale')} className="h-7 text-[10px]">Sales</Button>
               </div>
               <div className="relative w-48 no-print">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search invoice..." className="pl-8 h-8 text-[10px]" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Inv ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Entity</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Paid</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.length > 0 ? [...filteredInvoices].reverse().map(inv => (
                    <tr key={inv.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-accent">{inv.id}</td>
                      <td className="px-6 py-4 text-muted-foreground text-[10px]">{inv.date}</td>
                      <td className="px-6 py-4">
                        <Badge className={inv.type === 'purchase' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}>{inv.type.toUpperCase()}</Badge>
                      </td>
                      <td className="px-6 py-4 font-bold">{inv.vendorName || students.find(s => s.id === inv.studentId)?.name}</td>
                      <td className="px-6 py-4 font-black text-foreground">Rs.{inv.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">Rs.{inv.amountPaid?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={inv.paymentStatus === 'paid' ? 'border-emerald-500 text-emerald-600' : inv.paymentStatus === 'partial' ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'}>
                          {inv.paymentStatus?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                           {inv.paymentStatus !== 'paid' && (
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" title="Record Balance Payment" onClick={() => setPaymentBalanceRecord({ invoiceId: inv.id, amount: '' })}>
                               <Plus size={14} />
                             </Button>
                           )}
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600 hover:bg-indigo-50" onClick={() => {
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                  const student = inv.studentId ? students.find(s => s.id === inv.studentId) : null;
                                  const vendor = inv.vendorName ? vendors.find(v => v.name === inv.vendorName) : null;
                                  
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>Invoice ${inv.id}</title>
                                        <style>
                                          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
                                          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                                          .school-info h1 { margin: 0; font-size: 24px; color: #000; }
                                          .invoice-meta { text-align: right; }
                                          .details-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #eee; }
                                          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                                          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                          .table th { background: #1e293b; color: #fff; padding: 12px; text-align: left; text-transform: uppercase; font-size: 11px; }
                                          .table td { border-bottom: 1px solid #eee; padding: 12px; font-size: 12px; }
                                          .totals { float: right; width: 250px; }
                                          .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
                                          .grand-total { border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 16px; }
                                        </style>
                                      </head>
                                      <body onload="window.print();">
                                        <div class="header">
                                          <div class="school-info">
                                            <h1>Al-Naseeha High School</h1>
                                            <p style="margin:5px 0; color:#666;">Educational Quality & Excellence</p>
                                          </div>
                                          <div class="invoice-meta">
                                            <h2 style="margin:0; color:#1e293b;">${inv.type.toUpperCase()} INVOICE</h2>
                                            <p style="margin:5px 0 font-weight:bold;">ID: ${inv.id}</p>
                                            <p style="margin:0; color:#666;">Date: ${inv.date}</p>
                                          </div>
                                        </div>

                                        <div class="details-box">
                                          <div class="details-grid">
                                            <div>
                                              <p style="margin:0 0 5px 0; font-size:10px; color:#666; font-weight:bold; text-transform:uppercase;">${inv.type === 'purchase' ? 'Vendor Details' : 'Student Details'}</p>
                                              <p style="margin:0; font-weight:bold; font-size:16px;">${inv.studentName || inv.vendorName || 'General Customer'}</p>
                                              ${student ? `<p style="margin:5px 0 0 0; font-size:12px;">Class: ${student.grade} | Roll #: ${student.rollNumber}</p>` : ''}
                                              ${vendor && vendor.address ? `<p style="margin:5px 0 0 0; font-size:12px;">Address: ${vendor.address}</p>` : ''}
                                              ${vendor && vendor.contact ? `<p style="margin:5px 0 0 0; font-size:12px;">Contact: ${vendor.contact}</p>` : ''}
                                            </div>
                                            <div style="text-align:right;">
                                              <p style="margin:0 0 5px 0; font-size:10px; color:#666; font-weight:bold; text-transform:uppercase;">Payment Status</p>
                                              <div style="display:inline-block; padding:5px 15px; border:2px solid ${inv.paymentStatus === 'paid' ? '#10b981' : '#ef4444'}; color:${inv.paymentStatus === 'paid' ? '#10b981' : '#ef4444'}; font-weight:bold; border-radius:4px; text-transform:uppercase; font-size:12px;">
                                                ${inv.paymentStatus}
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <table class="table">
                                          <thead>
                                            <tr>
                                              <th>Description / Item Name</th>
                                              <th style="text-align:center;">Quantity</th>
                                              <th style="text-align:right;">Unit Price</th>
                                              <th style="text-align:right;">Discount</th>
                                              <th style="text-align:right;">Subtotal</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${inv.items.map(i => `
                                              <tr>
                                                <td style="font-weight:bold;">${i.name}</td>
                                                <td style="text-align:center;">${i.quantity}</td>
                                                <td style="text-align:right;">Rs.${i.unitPrice?.toLocaleString()}</td>
                                                <td style="text-align:right;">${i.discount || 0}%</td>
                                                <td style="text-align:right; font-weight:bold;">Rs.${i.subtotal?.toLocaleString()}</td>
                                              </tr>
                                            `).join('')}
                                          </tbody>
                                        </table>

                                        <div class="totals">
                                          ${inv.extraExpense ? `
                                            <div class="total-row">
                                              <span>Extra Expense (${inv.extraExpenseReason || 'Fare'}):</span>
                                              <span>Rs.${inv.extraExpense.toLocaleString()}</span>
                                            </div>
                                          ` : ''}
                                          ${inv.specialDiscount ? `
                                            <div class="total-row" style="color:#ef4444;">
                                              <span>Special Discount (Flat):</span>
                                              <span>-Rs.${inv.specialDiscount.toLocaleString()}</span>
                                            </div>
                                          ` : ''}
                                          <div class="total-row grand-total">
                                            <span>Payable Total:</span>
                                            <span>Rs.${inv.totalAmount.toLocaleString()}</span>
                                          </div>
                                          <div class="total-row" style="margin-top:5px; font-weight:bold; color:#10b981;">
                                            <span>Amount Paid:</span>
                                            <span>Rs.${inv.amountPaid.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                              }
                            }}><Printer size={14} /></Button>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => onDeleteInvoice(inv.id)}><Trash2 size={14} /></Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="p-10 text-center italic text-muted-foreground">No invoices recorded yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'vendorledger' && (
        <div className="space-y-6">
          <Card className="border border-border shadow-none rounded-xl overflow-hidden">
             <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-lg font-black">Vendor Ledger Statement</CardTitle>
                   <CardDescription className="text-xs">Track real-time balances, purchases, and payments per vendor</CardDescription>
                </div>
                <div className="flex gap-3">
                   <div className="w-64">
                      <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                         <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                         <SelectContent>
                            {vendors.map(v => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>
                   <Dialog open={showAddVendor} onOpenChange={setShowAddVendor}>
                      <DialogTrigger render={(props) => (
                         <Button {...props} variant="outline" className="border-primary text-primary hover:bg-primary/5 h-9 text-xs px-4">Add Vendor</Button>
                      )} />
                      <DialogContent>
                         <DialogHeader><DialogTitle>Register New Vendor</DialogTitle></DialogHeader>
                         <form onSubmit={handleAddVendor} className="space-y-4 pt-4">
                            <div className="space-y-2">
                               <Label className="text-xs">Vendor Name</Label>
                               <Input value={newVendorForm.name} onChange={e => setNewVendorForm({...newVendorForm, name: e.target.value})} required placeholder="e.g. Oxford Press" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <Label className="text-xs">Contact Number</Label>
                                  <Input value={newVendorForm.contact} onChange={e => setNewVendorForm({...newVendorForm, contact: e.target.value})} placeholder="0321-XXXXXXX" />
                               </div>
                               <div className="space-y-2">
                                  <Label className="text-xs">Opening Balance (Payable)</Label>
                                  <Input type="number" value={newVendorForm.openingBalance} onChange={e => setNewVendorForm({...newVendorForm, openingBalance: e.target.value})} placeholder="0.00" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <Label className="text-xs">Vendor Address</Label>
                               <Input value={newVendorForm.address} onChange={e => setNewVendorForm({...newVendorForm, address: e.target.value})} placeholder="Full office address" />
                            </div>
                            <DialogFooter className="pt-4">
                               <Button type="submit" className="w-full bg-primary text-white">Save Vendor Profile</Button>
                            </DialogFooter>
                         </form>
                      </DialogContent>
                   </Dialog>
                   <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
                      <DialogTrigger render={(props) => (
                         <Button {...props} disabled={!selectedVendor} className="bg-primary hover:bg-primary/90 text-white h-9 text-xs px-4">Record Payment</Button>
                      )} />
                      <DialogContent>
                         <DialogHeader><DialogTitle>New Vendor Payment</DialogTitle></DialogHeader>
                         <form onSubmit={handleAddPayment} className="space-y-4 pt-4">
                            <div className="space-y-2">
                               <Label className="text-xs">Selected Vendor</Label>
                               <Input value={selectedVendor} disabled className="bg-muted" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <Label className="text-xs">Payment Amount</Label>
                                  <Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} required placeholder="0.00" />
                               </div>
                               <div className="space-y-2">
                                  <Label className="text-xs">Payment Date</Label>
                                  <Input type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <Label className="text-xs">Payment Description</Label>
                               <Input value={paymentForm.description} onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} placeholder="e.g. Bank Transfer Ref #123" />
                            </div>
                            <DialogFooter className="pt-4">
                               <Button type="submit" className="w-full bg-primary text-white">Post Payment</Button>
                            </DialogFooter>
                         </form>
                      </DialogContent>
                   </Dialog>
                </div>
             </CardHeader>

             {vendorData ? (
               <CardContent className="p-0">
                  <div className="bg-muted/30 p-6 flex justify-between border-b">
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Vendor Details</p>
                        <h4 className="font-black text-xl">{vendorData.name}</h4>
                        <p className="text-xs text-muted-foreground">{vendorData.contact}</p>
                     </div>
                     <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Payable Balance</p>
                        <h4 className={`text-2xl font-black ${vendorBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Rs.{vendorBalance.toLocaleString()}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] italic text-muted-foreground truncate">Incl. Opening Balance: Rs.{vendorData.openingBalance.toLocaleString()}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 text-muted-foreground hover:text-primary" 
                            onClick={() => setEditingVendor(vendorData)}
                          >
                            <Edit size={10} />
                          </Button>
                        </div>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                        <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Details</th>
                          <th className="px-6 py-4">Debit (+Payable)</th>
                          <th className="px-6 py-4 text-emerald-600">Credit (-Payment)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr className="bg-muted/10 font-bold italic">
                           <td className="px-6 py-3">---</td>
                           <td className="px-6 py-3">Opening Balance</td>
                           <td className="px-6 py-3">Rs.{vendorData.openingBalance.toLocaleString()}</td>
                           <td className="px-6 py-3 text-emerald-600">Rs.0</td>
                        </tr>
                        {vendorTransactions.map((t, idx) => (
                          <tr key={idx} className="hover:bg-background transition-colors">
                            <td className="px-6 py-4 text-muted-foreground">{t.date}</td>
                            <td className="px-6 py-4 font-bold">{t.description}</td>
                            <td className="px-6 py-4 font-black">Rs.{t.debit.toLocaleString()}</td>
                            <td className="px-6 py-4 font-black text-emerald-600">Rs.{t.credit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </CardContent>
             ) : (
               <CardContent className="p-10 text-center italic text-muted-foreground">Select a vendor to view ledger</CardContent>
             )}
          </Card>
          
          {vendorData && (
             <div className="flex justify-end no-print">
               <Button onClick={() => window.print()} variant="outline" className="h-10 text-xs border-primary text-primary font-bold"><Printer size={16} className="mr-2" /> Print Vendor Statement</Button>
             </div>
          )}
        </div>
      )}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="bg-white border text-center p-6 shadow-none rounded-xl"><p className="text-[10px] font-bold text-muted-foreground uppercase">Total Purchase Demand</p><h3 className="text-2xl font-black text-rose-600">Rs.{purchaseTotal.toLocaleString()}</h3></Card>
             <Card className="bg-white border text-center p-6 shadow-none rounded-xl"><p className="text-[10px] font-bold text-muted-foreground uppercase">Total Sales Generated</p><h3 className="text-2xl font-black text-emerald-600">Rs.{saleTotal.toLocaleString()}</h3></Card>
             <Card className={`text-center p-6 text-white border-none shadow-none rounded-xl ${grossProfit >= 0 ? 'bg-primary' : 'bg-red-700'}`}><p className="text-[10px] font-bold text-white/70 uppercase">Net Inventory Outcome</p><h3 className="text-2xl font-black">Rs.{Math.abs(grossProfit).toLocaleString()}</h3></Card>
          </div>
          <Card className="border border-border shadow-none rounded-xl overflow-hidden">
             <CardHeader className="border-b bg-muted/20"><CardTitle className="text-sm font-black uppercase tracking-widest">Inventory Expense Analysis (Shipping/Fare)</CardTitle></CardHeader>
             <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead className="bg-background font-bold border-b text-muted-foreground">
                    <tr><th className="px-6 py-4">Invoice ID</th><th className="px-6 py-4">Expense Reason</th><th className="px-6 py-4 text-right">Expense Amount</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.filter(i => (i.extraExpense || 0) > 0).map(i => (
                       <tr key={i.id} className="hover:bg-background transition-colors"><td className="px-6 py-4 font-bold text-accent">{i.id}</td><td className="px-6 py-4 text-muted-foreground">{i.extraExpenseReason}</td><td className="px-6 py-4 text-right font-black text-foreground">Rs.{i.extraExpense?.toLocaleString()}</td></tr>
                    ))}
                    {invoices.filter(i => (i.extraExpense || 0) > 0).length === 0 && (
                      <tr><td colSpan={3} className="p-6 text-center italic text-muted-foreground">No extra expenses recorded.</td></tr>
                    )}
                  </tbody>
                </table>
             </CardContent>
          </Card>
          
          <div className="pt-4 flex justify-end no-print">
             <Button onClick={() => window.print()} variant="outline" className="h-10 text-xs border-primary text-primary font-bold"><Printer size={16} className="mr-2" /> Print Inventory Statement</Button>
          </div>
        </div>
      )}

      {/* Modal for Recording Remaining Payment */}
      <Dialog open={!!paymentBalanceRecord} onOpenChange={(open) => !open && setPaymentBalanceRecord(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Remaining Payment</DialogTitle>
            <DialogDescription className="text-xs">
              Posting payment to settle balance for Invoice #{paymentBalanceRecord?.invoiceId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold">Amount to Pay</Label>
              <Input 
                type="number" 
                value={paymentBalanceRecord?.amount || ''} 
                onChange={e => setPaymentBalanceRecord(prev => prev ? { ...prev, amount: e.target.value } : null)}
                placeholder="Enter amount..."
                className="h-10 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Total unpaid for this invoice: Rs.{(() => {
                  const inv = invoices.find(i => i.id === paymentBalanceRecord?.invoiceId);
                  return inv ? (inv.totalAmount - inv.amountPaid).toLocaleString() : '0';
                })()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentBalanceRecord(null)}>Cancel</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (!paymentBalanceRecord) return;
                const inv = invoices.find(i => i.id === paymentBalanceRecord.invoiceId);
                if (!inv) return;
                const payAmount = Number(paymentBalanceRecord.amount);
                const updatedInv: InventoryInvoice = {
                  ...inv,
                  amountPaid: inv.amountPaid + payAmount,
                  paymentStatus: (inv.amountPaid + payAmount) >= inv.totalAmount ? 'paid' : 'partial'
                };
                onUpdateInvoice(updatedInv, payAmount);
                setPaymentBalanceRecord(null);
              }}
            >
              Post Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for Editing Vendor Details */}
      <Dialog open={!!editingVendor} onOpenChange={(open) => !open && setEditingVendor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vendor Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold">Vendor Name</Label>
              <Input value={editingVendor?.name || ''} disabled className="bg-muted opacity-50" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold">Contact Info</Label>
              <Input 
                value={editingVendor?.contact || ''} 
                onChange={e => setEditingVendor(prev => prev ? { ...prev, contact: e.target.value } : null)}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold">Opening Balance (Payable)</Label>
              <Input 
                type="number" 
                value={editingVendor?.openingBalance || 0} 
                onChange={e => setEditingVendor(prev => prev ? { ...prev, openingBalance: Number(e.target.value) } : null)}
                className="h-10 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVendor(null)}>Cancel</Button>
            <Button 
              className="bg-primary text-white"
              onClick={() => {
                if (editingVendor) {
                  onUpdateVendor(editingVendor);
                  setEditingVendor(null);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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
    <Card className="border border-border shadow-none rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold">School Announcements</CardTitle>
          <CardDescription className="text-xs">Manage communications for students and staff</CardDescription>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white h-9 text-xs">
          <Plus size={16} className="mr-2" /> Create Announcement
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockAnnouncements.map((ann) => (
            <Card key={ann.id} className="bg-background border border-border shadow-none rounded-xl hover:border-accent transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-accent/10 text-accent p-2 rounded-lg">
                    <Bell size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ann.date}</span>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-2">{ann.title}</h4>
                <p className="text-muted-foreground text-[11px] mb-4 line-clamp-3 leading-relaxed">{ann.content}</p>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Target: {ann.targetRole}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold">Edit</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-xl shadow-accent/20 rotate-3">
              <GraduationCap size={40} className="text-white -rotate-3" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">Al-Naseeha School</h2>
          <p className="mt-2 text-sm text-slate-400 font-medium tracking-wide">Enter your credentials to manage the portal</p>
        </div>

        <Card className="border border-slate-800 bg-slate-900 shadow-2xl rounded-3xl overflow-hidden p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Login ID</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <Input 
                  type="text" 
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder="e.g. principal_admin" 
                  className="pl-10 h-12 bg-slate-950 border-slate-800 text-white focus:ring-accent"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Password</Label>
              <Input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="h-12 bg-slate-950 border-slate-800 text-white focus:ring-accent"
                required
              />
            </div>

            {error && <p className="text-xs font-bold text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? 'Logging in...' : 'Login Securely'}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4">Account Access Guide</p>
            <p className="text-[9px] text-slate-400">Contact the administrator if you have forgotten your Login ID or Password.</p>
          </div>
        </Card>
        
        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">Powered by Smart School OS &copy; 2026</p>
      </div>
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
            {mockAnnouncements.map(ann => (
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
