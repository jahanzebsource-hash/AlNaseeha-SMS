-- Al Naseeha High School Database Schema (PostgreSQL)

-- 1. Students Table
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    roll_number VARCHAR(100) UNIQUE NOT NULL,
    grade VARCHAR(50),
    section VARCHAR(50),
    monthly_fee NUMERIC(10, 2) DEFAULT 0,
    arrears NUMERIC(10, 2) DEFAULT 0,
    parent_name VARCHAR(255),
    parent_contact VARCHAR(50),
    address TEXT,
    date_of_birth DATE,
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teachers Table
CREATE TABLE teachers (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    contact_number VARCHAR(50),
    designation VARCHAR(100),
    base_salary NUMERIC(10, 2),
    subject VARCHAR(100),
    qualification TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fee Records Table
CREATE TABLE fee_records (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'paid'
);

-- 4. Transactions Table (General Ledger)
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')),
    category VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    month VARCHAR(20),
    year INTEGER,
    student_id TEXT, -- Optional relation for fee income
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Attendance Table
CREATE TABLE attendance (
    entity_id TEXT NOT NULL, -- Student or Teacher ID
    entity_type VARCHAR(20) CHECK (entity_type IN ('student', 'teacher')),
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'leave')),
    date DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    PRIMARY KEY (entity_id, entity_type, date)
);

-- 6. Payroll Table
CREATE TABLE payroll (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES teachers(id),
    amount NUMERIC(10, 2) NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'paid'
);

-- 7. Inventory Table
CREATE TABLE inventory (
    id TEXT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    purchase_price NUMERIC(10, 2),
    sale_price NUMERIC(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    unit VARCHAR(50),
    min_quantity INTEGER DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_students_roll ON students(roll_number);
CREATE INDEX idx_fees_student ON fee_records(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
