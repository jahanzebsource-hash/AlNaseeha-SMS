export type UserRole = 'admin' | 'principal' | 'teacher' | 'accountant' | 'student' | 'staff';

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
  arrears?: number;
  arrearsDescription?: string;
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

export interface FeeChallan {
  id: string;
  studentId: string;
  month: string;
  year: number;
  monthlyFee: number;
  arrears: number;
  arrearsDescription?: string;
  totalPayable: number;
  issueDate: string;
  dueDate: string;
  status: 'issued' | 'paid' | 'cancelled';
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 'Admission' | 'Yearly Charges' | 'Tuition Fee' | 'Rent' | 'Stationery Sale' | 'Others';
export type ExpenseCategory = 'Salaries' | 'Utilities' | 'Maintenance' | 'Rent' | 'Supplies' | 'Marketing' | 'Others';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  studentId?: string; // For Admission, Yearly Charges, Tuition Fee
  month: string;
  year: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
}

export interface InvoiceItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Percentage
  subtotal: number;
}

export interface InventoryInvoice {
  id: string;
  type: 'purchase' | 'sale';
  date: string;
  studentId?: string;
  studentName?: string;
  vendorName?: string;
  items: InvoiceItem[];
  extraExpense?: number;
  extraExpenseReason?: string;
  specialDiscount?: number; // Flat Amount
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  month: string;
  year: number;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  address?: string;
  openingBalance: number;
}

export interface VendorPayment {
  id: string;
  vendorName: string; // Linking by name as per user's current flow
  amount: number;
  date: string;
  description: string;
}

export interface TimetableEntry {
  id: string;
  grade: string;
  day: string;
  slotId: string; // Linking to TimetableSlot.id
  subject: string;
  teacherId: string;
}

export interface TimetableSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label: string; // e.g. "1st Period", "Break"
}
