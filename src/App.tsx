/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Plus
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
import { 
  mockStudents, 
  mockTeachers, 
  mockAnnouncements, 
  mockAttendance, 
  mockFees 
} from './lib/mockData';

type View = 'dashboard' | 'students' | 'teachers' | 'attendance' | 'fees' | 'exams' | 'announcements';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        return <DashboardView />;
      case 'students':
        return <StudentsView />;
      case 'teachers':
        return <TeachersView />;
      case 'attendance':
        return <AttendanceView />;
      case 'fees':
        return <FeesView />;
      case 'exams':
        return <ExamsView />;
      case 'announcements':
        return <AnnouncementsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'w-[240px]' : 'w-20'
        } fixed inset-y-0 left-0 z-50 border-r border-sidebar-border`}
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
                EduPro MS
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
        <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search student ID, staff or files..." 
              className="pl-10 w-[300px] bg-background border-border text-xs h-9 focus:ring-accent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-foreground">Admin Portal</div>
              <div className="text-[11px] text-muted-foreground">Session: 2023-24</div>
            </div>
            <Avatar className="h-8 w-8 bg-accent text-white font-bold text-xs">
              <AvatarFallback className="bg-accent text-white">AD</AvatarFallback>
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

function DashboardView() {
  const stats = [
    { label: 'Total Students', value: '1,248', delta: '+24 this month', icon: Users, color: 'text-blue-600' },
    { label: 'Active Teachers', value: '86', delta: '98% Attendance', icon: UserSquare2, color: 'text-emerald-600' },
    { label: 'Monthly Revenue', value: '$42,850', delta: '85% Collected', icon: CreditCard, color: 'text-amber-600' },
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
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { name: 'Arsalan Ahmed', id: '#ADM-2041', class: 'Grade 9-B', date: 'Oct 12, 2023' },
                    { name: 'Fatima Zahra', id: '#ADM-2042', class: 'Grade 4-A', date: 'Oct 13, 2023' },
                    { name: 'Zubair Khan', id: '#ADM-2043', class: 'Grade 11-C', date: 'Oct 14, 2023' },
                    { name: 'Sara Malik', id: '#ADM-2044', class: 'Grade 2-A', date: 'Oct 14, 2023' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-background transition-colors">
                      <td className="px-6 py-3 font-medium text-foreground">{row.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{row.id}</td>
                      <td className="px-6 py-3 text-muted-foreground">{row.class}</td>
                      <td className="px-6 py-3 text-muted-foreground">{row.date}</td>
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

function StudentsView() {
  return (
    <Card className="border border-border shadow-none rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-white">
        <div>
          <CardTitle className="text-lg font-bold">Student Directory</CardTitle>
          <CardDescription className="text-xs">Manage and view all student records</CardDescription>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white h-9 text-xs">
          <Plus size={16} className="mr-2" /> Add Student
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-background text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Parent Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">{student.name}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-muted-foreground">{student.grade} - {student.section}</td>
                  <td className="px-6 py-4 text-muted-foreground">{student.parentName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 hover:bg-accent/10 text-[11px] h-7">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TeachersView() {
  return (
    <Card className="border border-border shadow-none rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold">Faculty Members</CardTitle>
          <CardDescription className="text-xs">Manage teaching staff and assignments</CardDescription>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white h-9 text-xs">
          <Plus size={16} className="mr-2" /> Add Teacher
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTeachers.map((teacher) => (
            <Card key={teacher.id} className="bg-background border border-border shadow-none rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-accent text-white">{teacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-foreground">{teacher.name}</h4>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">{teacher.subject}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employee ID:</span>
                    <span className="font-bold text-foreground">{teacher.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qualification:</span>
                    <span className="font-bold text-foreground">{teacher.qualification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-bold text-foreground">{teacher.contactNumber}</span>
                  </div>
                </div>
                <Separator className="my-4 bg-border" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-[11px] h-8 border-border">Profile</Button>
                  <Button variant="outline" size="sm" className="flex-1 text-[11px] h-8 border-border">Schedule</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceView() {
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
              {mockStudents.map((student) => {
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

function FeesView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border shadow-none rounded-xl bg-primary text-white">
          <CardContent className="p-6">
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1">Total Collected</p>
            <h3 className="text-3xl font-bold">$42,850</h3>
            <p className="text-emerald-400 text-[11px] font-bold mt-2">+12% from last month</p>
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
                {mockStudents.map((student) => {
                  const fee = mockFees.find(f => f.studentId === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{student.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{student.rollNumber}</td>
                      <td className="px-6 py-4 text-muted-foreground">${fee?.amount || 500}</td>
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

function ExamsView() {
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
