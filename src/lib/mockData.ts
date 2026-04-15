import { Student, Teacher, Attendance, FeeRecord, ExamResult, Announcement } from '../types';

export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Ali Khan',
    email: 'ali@example.com',
    role: 'student',
    rollNumber: '101',
    grade: '10th',
    section: 'A',
    parentName: 'Ahmed Khan',
    parentContact: '0300-1234567',
    address: 'Lahore, Pakistan',
    createdAt: new Date().toISOString(),
  },
  {
    id: 's2',
    name: 'Sara Ahmed',
    email: 'sara@example.com',
    role: 'student',
    rollNumber: '102',
    grade: '10th',
    section: 'A',
    parentName: 'Ahmed Ali',
    parentContact: '0300-7654321',
    address: 'Karachi, Pakistan',
    createdAt: new Date().toISOString(),
  }
];

export const mockTeachers: Teacher[] = [
  {
    id: 't1',
    name: 'Dr. Jameel',
    email: 'jameel@example.com',
    role: 'teacher',
    employeeId: 'T001',
    subject: 'Mathematics',
    qualification: 'PhD in Mathematics',
    contactNumber: '0321-1112223',
    createdAt: new Date().toISOString(),
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Summer Vacation Notice',
    content: 'School will remain closed from June 1st to August 14th for summer vacations.',
    date: '2024-05-15',
    authorId: 'admin1',
    targetRole: 'all'
  },
  {
    id: 'a2',
    title: 'Parent Teacher Meeting',
    content: 'PTM for the first term will be held on Saturday, May 25th.',
    date: '2024-05-20',
    authorId: 'admin1',
    targetRole: 'all'
  }
];

export const mockAttendance: Attendance[] = [
  { id: 'att1', studentId: 's1', date: '2024-05-22', status: 'present', markedBy: 't1' },
  { id: 'att2', studentId: 's2', date: '2024-05-22', status: 'absent', markedBy: 't1' }
];

export const mockFees: FeeRecord[] = [
  { id: 'f1', studentId: 's1', amount: 5000, month: 'May', year: 2024, status: 'paid', paymentDate: '2024-05-05' },
  { id: 'f2', studentId: 's2', amount: 5000, month: 'May', year: 2024, status: 'pending' }
];
