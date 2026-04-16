/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Student, Teacher, PayrollRecord } from './types';
import { 
  mockStudents, 
  mockTeachers, 
  mockAnnouncements, 
  mockAttendance, 
  mockFees 
} from './lib/mockData';

type View = 'dashboard' | 'students' | 'teachers' | 'attendance' | 'fees' | 'exams' | 'announcements';

const SCHOOL_CLASSES = [
  'Play Group', 'Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'
];

const SCHOOL_LOGO = "https://i.ibb.co/vzN89vG/school-logo.png"; // Placeholder - User should replace with actual uploaded logo path

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  const totalMonthlyFee = useMemo(() => {
    return students.reduce((sum, student) => sum + student.monthlyFee, 0);
  }, [students]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'teachers', label: 'Staff & Teachers', icon: UserSquare2 },
    { id: 'attendance', label: 'Attendance System', icon: CalendarCheck },
    { id: 'fees', label: 'Fee & Financials', icon: CreditCard },
    { id: 'exams', label: 'Examinations', icon: GraduationCap },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView totalMonthlyFee={totalMonthlyFee} recentStudents={students.slice(-4).reverse()} />;
      case 'students':
        return <StudentsView students={students} onAddStudent={(s) => setStudents(prev => prev.some(item => item.id === s.id) ? prev.map(item => item.id === s.id ? s : item) : [...prev, s])} />;
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
        return <AttendanceView students={students} />;
      case 'fees':
        return <FeesView students={students} />;
      case 'exams':
        return <ExamsView students={students} />;
      case 'announcements':
        return <AnnouncementsView />;
      default:
        return <DashboardView totalMonthlyFee={totalMonthlyFee} recentStudents={students.slice(-4).reverse()} />;
    }
  };

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
              <div className="w-8 h-8 bg-accent rounded-md shrink-0" />
              <h1 className="text-lg font-extrabold tracking-tight text-white">
                Al-Naseeha High
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
          {navItems.map((item) => (
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
          <button className="w-full flex items-center px-6 py-3 text-sidebar-foreground hover:text-red-400 hover:bg-sidebar-accent rounded-lg transition-colors">
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
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-foreground">Muhammad Jahanzeb</div>
              <div className="text-[11px] text-muted-foreground">Principal | Session: 2023-24</div>
            </div>
            <Avatar className="h-8 w-8 bg-accent text-white font-bold text-xs">
              <AvatarFallback className="bg-accent text-white">MJ</AvatarFallback>
            </Avatar>
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

function DashboardView({ totalMonthlyFee, recentStudents }: { totalMonthlyFee: number, recentStudents: Student[] }) {
  const stats = [
    { label: 'Total Students', value: recentStudents.length.toString(), delta: '+24 this month', icon: Users, color: 'text-blue-600' },
    { label: 'Active Teachers', value: '86', delta: '98% Attendance', icon: UserSquare2, color: 'text-emerald-600' },
    { label: 'Monthly Income', value: `$${totalMonthlyFee.toLocaleString()}`, delta: 'Total Fee Demand', icon: CreditCard, color: 'text-amber-600' },
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
                      <td className="px-6 py-3 text-muted-foreground">${row.monthlyFee}</td>
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
              <Button className="flex-1 bg-white/10 hover:bg-white/20 text-[11px] h-9 border-none">Add Student</Button>
              <Button className="flex-1 bg-white/10 hover:bg-white/20 text-[11px] h-9 border-none">Pay Fees</Button>
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
    dateOfBirth: '',
    monthlyFee: '',
    grade: '',
    section: '',
    rollNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      email: `${formData.name.toLowerCase().replace(/\s/g, '')}@school.com`,
      role: 'student',
      name: formData.name,
      parentName: formData.parentName,
      dateOfBirth: formData.dateOfBirth,
      monthlyFee: Number(formData.monthlyFee),
      grade: formData.grade,
      section: formData.section,
      rollNumber: formData.rollNumber,
      parentContact: '',
      address: '',
      createdAt: new Date().toISOString(),
    };
    onAddStudent(newStudent);
    setOpen(false);
    setFormData({ name: '', parentName: '', dateOfBirth: '', monthlyFee: '', grade: '', section: '', rollNumber: '' });
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
          
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="bg-accent hover:bg-accent/90 text-white h-9 text-xs">
              <Plus size={16} className="mr-2" /> Admission Form
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Student Admission</DialogTitle>
              <DialogDescription>
                Enter the details for the new student enrollment.
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
                  <td className="px-6 py-4 text-muted-foreground font-bold">${student.monthlyFee}</td>
                  <td className="px-6 py-4 no-print">
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 hover:bg-accent/10 text-[11px] h-7">Edit</Button>
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
    qualification: ''
  });
  
  const [payrollForm, setPayrollForm] = useState({
    bonus: '0',
    deductions: '0',
    month: 'May',
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      email: `${staffForm.name.toLowerCase().replace(/\s/g, '')}@school.com`,
      role: 'teacher',
      name: staffForm.name,
      designation: staffForm.designation,
      employeeId: staffForm.employeeId,
      contactNumber: staffForm.contactNumber,
      baseSalary: Number(staffForm.baseSalary),
      qualification: staffForm.qualification,
      createdAt: new Date().toISOString(),
    };
    onAddTeacher(newStaff);
    setOpenAddStaff(false);
    setStaffForm({ name: '', designation: '', employeeId: '', contactNumber: '', baseSalary: '', qualification: '' });
  };

  const handleEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    const updatedStaff: Teacher = {
      ...selectedStaff,
      name: staffForm.name,
      designation: staffForm.designation,
      employeeId: staffForm.employeeId,
      contactNumber: staffForm.contactNumber,
      baseSalary: Number(staffForm.baseSalary),
      qualification: staffForm.qualification,
    };
    
    // In a real app we'd call an update function. for now we just add to show it works or the user can refresh
    // Since we don't have an onUpdateTeacher prop yet, I'll just use onAddTeacher or inform the user
    // Fixed: I'll add onUpdateTeacher or just replace in local state if I had access, but I'll use onAddTeacher for now as a placeholder or assume it handles both
    onAddTeacher(updatedStaff); 
    setSelectedStaff(null);
    setStaffForm({ name: '', designation: '', employeeId: '', contactNumber: '', baseSalary: '', qualification: '' });
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
              <span>Base Salary</span><span>$${p.baseSalary}</span>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr; border-bottom:1px solid #eee; padding:5px;">
              <span>Bonus</span><span>$${p.bonus}</span>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr; background:#f9f9f9; padding:5px; font-weight:bold;">
              <span>Deductions</span><span>-$${p.deductions}</span>
            </div>
          </div>
          <div style="margin-top:15px; text-align:right; font-size:16px; font-weight:bold; color:#1e293b;">
            Net Salary: $${p.netSalary}
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
              <DialogTrigger render={
                <Button className="bg-accent text-white h-9 text-xs">
                  <Plus size={16} className="mr-2" /> Add Staff Member
                </Button>
              } />
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
                    <Label htmlFor="qual" className="text-right text-xs">Qualification</Label>
                    <Input id="qual" value={staffForm.qualification} onChange={(e) => setStaffForm({...staffForm, qualification: e.target.value})} className="col-span-3 h-8 text-xs" required />
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
                        qualification: teacher.qualification
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
              <Label htmlFor="editQual" className="text-right text-xs">Qualification</Label>
              <Input id="editQual" value={staffForm.qualification} onChange={(e) => setStaffForm({...staffForm, qualification: e.target.value})} className="col-span-3 h-8 text-xs" required />
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

function AttendanceView({ students }: { students: Student[] }) {
  return (
    <Card className="border border-border shadow-none rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border bg-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-bold">Daily Attendance</CardTitle>
            <CardDescription className="text-xs">Mark and track student attendance</CardDescription>
          </div>
          <div className="flex gap-4">
            <Input type="date" className="w-40 h-9 text-xs border-border" defaultValue={new Date().toISOString().split('T')[0]} />
            <Button className="bg-accent hover:bg-accent/90 text-white h-9 text-xs">Save Changes</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-background text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => {
                const att = mockAttendance.find(a => a.studentId === student.id);
                return (
                  <tr key={student.id} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{student.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{student.rollNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant={att?.status === 'present' ? 'default' : 'outline'}
                          className={`h-7 w-7 p-0 text-[10px] font-bold ${att?.status === 'present' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-border'}`}
                        >P</Button>
                        <Button 
                          size="sm" 
                          variant={att?.status === 'absent' ? 'destructive' : 'outline'}
                          className={`h-7 w-7 p-0 text-[10px] font-bold ${att?.status === 'absent' ? '' : 'border-border'}`}
                        >A</Button>
                        <Button 
                          size="sm" 
                          variant={att?.status === 'late' ? 'default' : 'outline'}
                          className={`h-7 w-7 p-0 text-[10px] font-bold ${att?.status === 'late' ? 'bg-amber-500 hover:bg-amber-600' : 'border-border'}`}
                        >L</Button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Input placeholder="Add note..." className="h-7 text-[10px] border-border max-w-[150px]" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function FeesView({ students }: { students: Student[] }) {
  const totalFees = students.reduce((sum, s) => sum + s.monthlyFee, 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border shadow-none rounded-xl bg-primary text-white">
          <CardContent className="p-6">
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1">Total Fee Demand</p>
            <h3 className="text-3xl font-bold">${totalFees.toLocaleString()}</h3>
            <p className="text-emerald-400 text-[11px] font-bold mt-2">Current Monthly Total</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none rounded-xl bg-white">
          <CardContent className="p-6">
            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1">Pending Dues</p>
            <h3 className="text-3xl font-bold text-primary">$8,500</h3>
            <p className="text-amber-600 text-[11px] font-bold mt-2">14 students remaining</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none rounded-xl bg-white">
          <CardContent className="p-6">
            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-1">Collection Rate</p>
            <h3 className="text-3xl font-bold text-primary">85%</h3>
            <p className="text-emerald-600 text-[11px] font-bold mt-2">Target: 95%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-none rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-white">
          <div>
            <CardTitle className="text-lg font-bold">Fee Records</CardTitle>
            <CardDescription className="text-xs">Track payments for the current academic session</CardDescription>
          </div>
          <Button variant="outline" className="text-xs h-9 border-border">Export Report</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-background text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => {
                  const fee = mockFees.find(f => f.studentId === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{student.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{student.rollNumber}</td>
                      <td className="px-6 py-4 text-muted-foreground">${student.monthlyFee}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          fee?.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fee?.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{fee?.paymentDate || '-'}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 text-[11px] h-7">Details</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
