import express from "express";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import fs from "fs";

dotenv.config();

const { Pool } = pg;

// Helper to convert snake_case keys to camelCase
function toCamelCase(rows: any[]) {
  return rows.map(row => {
    const camelCased: any = {};
    for (const key in row) {
      const camelKey = key.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
      });
      camelCased[camelKey] = row[key];
    }
    return camelCased;
  });
}

// Lazy initialized database pool
let pool: pg.Pool | null = null;

function getPool() {
  if (!pool) {
    const sbUrl = process.env.SUPABASE_DATABASE_URL;
    const dbUrl = process.env.DATABASE_URL;
    
    let connectionString = sbUrl || dbUrl;
    
    if (sbUrl) console.log("Using SUPABASE_DATABASE_URL.");
    else if (dbUrl) console.log("Using DATABASE_URL.");

    if (!connectionString) {
      console.error("No database connection string found!");
      return null;
    }
    
    connectionString = connectionString.replace(/['"]/g, '').trim();

    // Security & Stability: If Supabase direct port 5432 is found, warn the user
    if (connectionString.includes('supabase.co') && connectionString.includes(':5432')) {
       console.warn("CRITICAL: Port 5432 detected for Supabase. This will likely fail on Vercel. Please use Pooler (port 6543).");
    }

    try {
      const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
      console.log(`Attempting connection to: ${maskedUrl}`);

      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        connectionTimeoutMillis: 20000, // 20 seconds
        max: 10
      });
      
      pool.on('error', (err) => {
        console.error('Pool Error:', err.message);
        pool = null;
      });
      
    } catch (err: any) {
      console.error("Pool initialization Failed:", err.message);
      return null;
    }
  }
  return pool;
}

const app = express();
app.use(express.json());

app.use(async (req, res, next) => {
  if (!isInitialized) {
    try {
      await ensureDbInitialized();
      isInitialized = true;
    } catch (err: any) {
      console.error("Critical: Initialization failed", err.message);
    }
  }
  next();
});

// API Routes
app.get("/api/db-debug", (req, res) => {
  const sbUrl = process.env.SUPABASE_DATABASE_URL;
  const dbUrl = process.env.DATABASE_URL;
  
  const mask = (url?: string) => url ? url.replace(/:([^:@]+)@/, ':****@') : null;
  
  res.json({
    hasSupabaseUrl: !!sbUrl,
    hasDatabaseUrl: !!dbUrl,
    supabaseUrlMasked: mask(sbUrl),
    databaseUrlMasked: mask(dbUrl),
    effectiveUrlMasked: mask(sbUrl || dbUrl),
    nodeVersion: process.version,
    env: process.env.NODE_ENV
  });
});

app.get("/api/health", async (req, res) => {
  const db = getPool();
  let dbStatus = false;
  let dbError = null;

  if (db) {
    try {
      const result = await db.query("SELECT 1");
      dbStatus = result.rowCount === 1;
    } catch (err: any) {
      dbError = err.message;
      console.error("Database health check failed:", err.message);
    }
  }

  res.json({ 
    status: "ok", 
    database: dbStatus,
    databaseConfigured: !!process.env.DATABASE_URL,
    error: dbError
  });
});

// Ensure database is initialized
let isInitialized = false;
async function ensureDbInitialized() {
  const db = getPool();
  if (!db) return;

  try {
    // Check for teachers table existence
    const { rows } = await db.query("SELECT to_regclass('teachers') as table_exists");
    
    if (!rows[0].table_exists) {
      console.log("Database missing. Initializing full schema...");
      const schemaPath = path.join(process.cwd(), "schema.sql");
      const sql = fs.readFileSync(schemaPath, "utf8");
      const statements = sql.split(';').filter(s => s.trim() !== '');
      for (let s of statements) {
        try { await db.query(s); } catch (e) {} 
      }
    } else {
      // Table exists but might be old. Surgically add missing columns
      console.log("Verifying teacher table columns...");
      const teacherMigrations = [
        "ALTER TABLE teachers ADD COLUMN IF NOT EXISTS login_id VARCHAR(100) UNIQUE",
        "ALTER TABLE teachers ADD COLUMN IF NOT EXISTS password_hash TEXT",
        "ALTER TABLE teachers ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'teacher'",
        "ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_teaching BOOLEAN DEFAULT TRUE",
        "ALTER TABLE teachers ADD COLUMN IF NOT EXISTS designation VARCHAR(100)",
        "ALTER TABLE teachers ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50)",
        "ALTER TABLE teachers ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50)"
      ];
      for (let sql of teacherMigrations) {
        try {
          await db.query(sql);
        } catch (e: any) {
          if (!e.message.includes('already exists')) console.error("Teacher migration error:", e.message);
        }
      }

      console.log("Verifying student table columns...");
      const studentMigrations = [
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE"
      ];
      for (let sql of studentMigrations) {
        try {
          await db.query(sql);
        } catch (e: any) {
          if (!e.message.includes('already exists')) console.error("Student migration error:", e.message);
        }
      }
    }

    // Always ensure principal jahanzeb exists
    const { rows: tRows } = await db.query("SELECT * FROM teachers WHERE login_id = $1", ['jahanzeb']);
    if (tRows.length === 0) {
      const passHash = await bcrypt.hash("123", 10);
      await db.query(
        `INSERT INTO teachers (id, name, email, role, login_id, password_hash, designation, is_teaching) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        ['admin_default', 'Muhammad Jahanzeb', 'principal@alnaseeha.edu', 'principal', 'jahanzeb', passHash, 'Principal', false]
      );
      console.log("Principal account seeded.");
    }
    isInitialized = true;
  } catch (err: any) {
    console.error("Critical DB Init Failure:", err.message);
  }
}

// Auth
app.post("/api/login", async (req, res) => {
  try {
    await ensureDbInitialized();
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    
    const { loginId, password } = req.body;

    // AGGRESSIVE SEEDING: If this is the principal logging in, ensure account exists RIGHT NOW
    if (loginId === 'jahanzeb' && password === '123') {
      console.log("Principal login detected. Validating/Creating account...");
      const passHash = await bcrypt.hash("123", 10);
      try {
        // Try to insert or update the principal directly
        await db.query(`
          INSERT INTO teachers (id, name, email, role, login_id, password_hash, designation, is_teaching)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (login_id) DO UPDATE 
          SET password_hash = EXCLUDED.password_hash, role = 'principal'
        `, ['admin_default', 'Muhammad Jahanzeb', 'principal@alnaseeha.edu', 'principal', 'jahanzeb', passHash, 'Principal', false]);
        console.log("Principal account synchronized successfully.");
      } catch (err: any) {
        console.error("Critical: Could not auto-sync principal account:", err.message);
        // We will try to proceed anyway to see if the user exists
      }
    }
    
    const result = await db.query("SELECT * FROM teachers WHERE login_id = $1", [loginId]);
    
    if (result.rows.length === 0) {
      console.log(`Login failed: User '${loginId}' not found.`);
      return res.status(401).json({ error: "Invalid login ID or password" });
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      console.log(`Login failed: Password mismatch for user '${loginId}'.`);
      return res.status(401).json({ error: "Invalid login ID or password" });
    }
    
    const profile = toCamelCase([user])[0];
    delete profile.passwordHash;
    res.json(profile);
  } catch (err: any) {
    console.error("Login route error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Students
app.get("/api/students", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM students ORDER BY name ASC");
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/students", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { id, name, email, rollNumber, grade, section, parentName, parentContact, address, dateOfBirth, monthlyFee, arrears, isActive } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO students (id, name, email, roll_number, grade, section, parent_name, parent_contact, address, date_of_birth, monthly_fee, arrears, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       ON CONFLICT (id) DO UPDATE SET 
       name=$2, email=$3, roll_number=$4, grade=$5, section=$6, parent_name=$7, parent_contact=$8, address=$9, date_of_birth=$10, monthly_fee=$11, arrears=$12, is_active=$13
       RETURNING *`,
      [id || Math.random().toString(36).substr(2, 9), name, email, rollNumber, grade, section, parentName, parentContact, address, dateOfBirth, monthlyFee, arrears || 0, isActive !== undefined ? isActive : true]
    );
    res.status(201).json(toCamelCase(result.rows)[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { id } = req.params;
  try {
    await db.query("DELETE FROM students WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Teachers
app.get("/api/teachers", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM teachers ORDER BY name ASC");
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/api/teachers", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { 
    id, name, email, contactNumber, designation, baseSalary, 
    subject, qualification, loginId, password, role, 
    assignedClass, isTeaching, employeeId 
  } = req.body;
  
  try {
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }
    const existing = await db.query("SELECT * FROM teachers WHERE id = $1", [id]);
    let result;
    if (existing.rows.length > 0) {
      const query = `
        UPDATE teachers SET 
        name=$2, email=$3, contact_number=$4, designation=$5, base_salary=$6, 
        subject=$7, qualification=$8, login_id=$9, role=$10, assigned_class=$11, is_teaching=$12, employee_id=$13
        ${passwordHash ? ', password_hash=$14' : ''}
        WHERE id=$1
        RETURNING *
      `;
      const params = [id, name, email, contactNumber, designation, baseSalary, subject, qualification, loginId, role, assignedClass, isTeaching, employeeId];
      if (passwordHash) params.push(passwordHash);
      result = await db.query(query, params);
    } else {
      result = await db.query(
        `INSERT INTO teachers 
         (id, name, email, contact_number, designation, base_salary, subject, qualification, login_id, password_hash, role, assigned_class, is_teaching, employee_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
        [id || Math.random().toString(36).substr(2, 9), name, email, contactNumber, designation, baseSalary, subject, qualification, loginId, passwordHash, role, assignedClass, isTeaching, employeeId]
      );
    }
    const profile = toCamelCase(result.rows)[0];
    delete profile.passwordHash;
    res.status(201).json(profile);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Fees
app.get("/api/fees", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query(`
      SELECT f.*, s.name as student_name, s.roll_number 
      FROM fee_records f 
      JOIN students s ON f.student_id = s.id 
      ORDER BY f.payment_date DESC
    `);
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/api/fees", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { id, studentId, amount, paymentDate, month, year, status } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO fee_records (id, student_id, amount, payment_date, month, year, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (id) DO UPDATE SET 
       amount=$3, payment_date=$4, month=$5, year=$6, status=$7
       RETURNING *`,
      [id || Math.random().toString(36).substr(2, 9), studentId, amount, paymentDate, month, year, status]
    );
    res.status(201).json(toCamelCase(result.rows)[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Transactions
app.get("/api/transactions", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM transactions ORDER BY date DESC");
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/api/transactions", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { id, type, category, amount, description, date, month, year, studentId } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO transactions (id, type, category, amount, description, date, month, year, student_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       ON CONFLICT (id) DO UPDATE SET 
       type=$2, category=$3, amount=$4, description=$5, date=$6, month=$7, year=$8, student_id=$9
       RETURNING *`,
      [id || Math.random().toString(36).substr(2, 9), type, category, amount, description, date, month, year, studentId]
    );
    res.status(201).json(toCamelCase(result.rows)[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Attendance
app.post("/api/attendance", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { entityId, entityType, status, date, remarks } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO attendance (entity_id, entity_type, status, date, remarks) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (entity_id, entity_type, date) 
       DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks 
       RETURNING *`,
      [entityId, entityType, status, date, remarks]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.get("/api/attendance", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM attendance ORDER BY date DESC");
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Inventory
app.get("/api/inventory", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM inventory ORDER BY item_name ASC");
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/api/inventory", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { id, itemName, category, purchasePrice, salePrice, stockQuantity, unit, minQuantity } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO inventory (id, item_name, category, purchase_price, sale_price, stock_quantity, unit, min_quantity) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (id) DO UPDATE SET 
       item_name=$2, category=$3, purchase_price=$4, sale_price=$5, stock_quantity=$6, unit=$7, min_quantity=$8
       RETURNING *`,
      [id || Math.random().toString(36).substr(2, 9), itemName, category, purchasePrice, salePrice, stockQuantity, unit, minQuantity]
    );
    res.status(201).json(toCamelCase(result.rows)[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Settings
app.get("/api/settings", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM school_settings");
    const settingsMap: any = {};
    result.rows.forEach(row => {
      settingsMap[row.key] = row.value;
    });
    res.json(settingsMap);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/api/settings", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { key, value } = req.body;
  try {
    await db.query(
      "INSERT INTO school_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=CURRENT_TIMESTAMP",
      [key, JSON.stringify(value)]
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});



export default app;
