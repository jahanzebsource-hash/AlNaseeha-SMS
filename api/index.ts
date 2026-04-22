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
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("DATABASE_URL not found. Database functionality will be unavailable.");
      return null;
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

const app = express();
app.use(express.json());

// API Routes
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
  if (isInitialized) return;
  const db = getPool();
  if (!db) return;

  try {
    const { rows } = await db.query("SELECT to_regclass('students') as table_exists");
    if (!rows[0].table_exists) {
      console.log("Starting full database initialization...");
      const schemaPath = path.join(process.cwd(), "schema.sql");
      const sql = fs.readFileSync(schemaPath, "utf8");
      await db.query(sql);
      console.log("Database schema applied successfully.");
    }

    // Always ensure principal exists on every initialization check
    const { rows: teacherRows } = await db.query("SELECT * FROM teachers WHERE login_id = $1", ['jahanzeb']);
    if (teacherRows.length === 0) {
      console.log("Seeding principal account...");
      const passHash = await bcrypt.hash("123", 10);
      await db.query(
        `INSERT INTO teachers (id, name, email, role, login_id, password_hash, designation, is_teaching) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        ['admin_default', 'Muhammad Jahanzeb', 'principal@alnaseeha.edu', 'principal', 'jahanzeb', passHash, 'Principal', false]
      );
      console.log("Principal account 'jahanzeb' created successfully.");
    }
    isInitialized = true;
  } catch (err: any) {
    console.error("Database initialization/seeding failed:", err.message);
    throw err;
  }
}

// Auth
app.post("/api/login", async (req, res) => {
  try {
    await ensureDbInitialized();
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    
    const { loginId, password } = req.body;
    const result = await db.query("SELECT * FROM teachers WHERE login_id = $1", [loginId]);
    
    if (result.rows.length === 0) {
      console.log(`Login failed: User '${loginId}' not found in database.`);
      return res.status(401).json({ error: "Invalid login ID or password" });
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      console.log(`Login failed: Incorrect password for user '${loginId}'.`);
      return res.status(401).json({ error: "Invalid login ID or password" });
    }
    
    const profile = toCamelCase([user])[0];
    delete profile.passwordHash;
    res.json(profile);
  } catch (err: any) {
    console.error("Login route error:", err.message);
    res.status(500).json({ error: "Internal Server Error or DB Connection issue" });
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
  const { id, name, email, rollNumber, grade, section, parentName, parentContact, address, dateOfBirth, monthlyFee, arrears } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO students (id, name, email, roll_number, grade, section, parent_name, parent_contact, address, date_of_birth, monthly_fee, arrears) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       ON CONFLICT (id) DO UPDATE SET 
       name=$2, email=$3, roll_number=$4, grade=$5, section=$6, parent_name=$7, parent_contact=$8, address=$9, date_of_birth=$10, monthly_fee=$11, arrears=$12
       RETURNING *`,
      [id || Math.random().toString(36).substr(2, 9), name, email, rollNumber, grade, section, parentName, parentContact, address, dateOfBirth, monthlyFee, arrears || 0]
    );
    res.status(201).json(toCamelCase(result.rows)[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Teachers
app.get("/api/teachers", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM teachers ORDER BY name ASC");
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/teachers", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { 
    id, name, email, contactNumber, designation, baseSalary, 
    subject, qualification, loginId, password, role, 
    assignedClass, isTeaching 
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
        subject=$7, qualification=$8, login_id=$9, role=$10, assigned_class=$11, is_teaching=$12
        ${passwordHash ? ', password_hash=$13' : ''}
        WHERE id=$1
        RETURNING *
      `;
      const params = [id, name, email, contactNumber, designation, baseSalary, subject, qualification, loginId, role, assignedClass, isTeaching];
      if (passwordHash) params.push(passwordHash);
      result = await db.query(query, params);
    } else {
      result = await db.query(
        `INSERT INTO teachers 
         (id, name, email, contact_number, designation, base_salary, subject, qualification, login_id, password_hash, role, assigned_class, is_teaching) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING *`,
        [id || Math.random().toString(36).substr(2, 9), name, email, contactNumber, designation, baseSalary, subject, qualification, loginId, passwordHash, role, assignedClass, isTeaching]
      );
    }
    const profile = toCamelCase(result.rows)[0];
    delete profile.passwordHash;
    res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Transactions
app.get("/api/transactions", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM transactions ORDER BY date DESC");
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/attendance", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM attendance ORDER BY date DESC");
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Inventory
app.get("/api/inventory", async (req, res) => {
  const db = getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    const result = await db.query("SELECT * FROM inventory ORDER BY item_name ASC");
    res.json(toCamelCase(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



export default app;
