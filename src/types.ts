export type UserRole = 'admin' | 'teacher' | 'student' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Student extends UserProfile {
  role: 'student';
  rollNumber: string;
  grade: string;
  section: string;
  parentName: string;
  parentContact: string;
  address: string;
  dateOfBirth: string;
  monthlyFee: number;
}

export interface Teacher extends UserProfile {
  role: 'teacher' | 'staff';
  employeeId: string;
  subject?: string;
  qualification: string;
  contactNumber: string;
  baseSalary: number;
  designation: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending';
  paymentDate?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  markedBy: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  month: string;
  year: number;
  status: 'paid' | 'pending';
  paymentDate?: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  examType: 'midterm' | 'final' | 'monthly';
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
  targetRole: UserRole | 'all';
}
