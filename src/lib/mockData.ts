import { Student, Teacher, Attendance, FeeRecord, ExamResult, Announcement, FinanceTransaction, InventoryItem, Vendor, VendorPayment } from '../types';

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
    dateOfBirth: '2008-05-15',
    monthlyFee: 5000,
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
    dateOfBirth: '2009-02-10',
    monthlyFee: 5500,
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
    baseSalary: 45000,
    designation: 'Senior Teacher',
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

export const mockTransactions: FinanceTransaction[] = [];

export const mockInventory: InventoryItem[] = [
  { id: 'i1', name: 'Biology Book Class 9', category: 'Books', purchasePrice: 250, salePrice: 300, stockQuantity: 50 },
  { id: 'i2', name: 'Mathematics Book Class 10', category: 'Books', purchasePrice: 300, salePrice: 350, stockQuantity: 40 },
  { id: 'i3', name: 'School Copy (Single Line)', category: 'Copies', purchasePrice: 40, salePrice: 60, stockQuantity: 100 },
  { id: 'i4', name: 'School Badge', category: 'Uniform', purchasePrice: 20, salePrice: 40, stockQuantity: 200 }
];

export const mockVendors: Vendor[] = [
  { id: 'v1', name: 'ABC Books Distributor', contact: '0300-1112223', openingBalance: 5000 },
  { id: 'v2', name: 'Quality Stationery Mart', contact: '0321-4445556', openingBalance: 0 }
];

export const mockVendorPayments: VendorPayment[] = [];
