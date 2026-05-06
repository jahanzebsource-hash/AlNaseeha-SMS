import express from "express";
import { createServer as createViteServer } from "vite";
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
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const camelKey = key.replace(/([-_][a-z])/ig, ($1) => {
          return $1.toUpperCase()
            .replace("-", "")
            .replace("_", "");
        });
        camelCased[camelKey] = row[key];
      }
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
      console.warn("DATABASE_URL not found. Database functionality will be limited to internal state until configured.");
      return null;
    }
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("supabase") || connectionString.includes("require") ? {
        rejectUnauthorized: false 
      } : false,
      connectionTimeoutMillis: 5000, // 5 second timeout
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

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
        if (err.code === 'ECONNREFUSED') {
          dbError = "Database connection refused. Check your DATABASE_URL and database availability.";
        }
      }
    }

    res.json({ 
      status: "ok", 
      database: dbStatus,
      databaseConfigured: !!process.env.DATABASE_URL,
      type: "postgresql",
      error: dbError
    });
  });

  // Auth
  app.post("/api/login", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    const { loginId, password } = req.body;
    try {
      const result = await db.query("SELECT * FROM teachers WHERE login_id = $1", [loginId]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid login ID or password" });
      }
      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid login ID or password" });
      }

      const profile = toCamelCase([user])[0];
      delete profile.passwordHash;
      res.json(profile);
    } catch (err) {
      console.error(err);
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
    } catch (err: any) {
      handleDbError(err, res);
    }
  });

  app.post("/api/students", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });

    const { id, name, email, rollNumber, grade, section, gender, parentName, parentContact, address, dateOfBirth, monthlyFee, arrears } = req.body;
    try {
      const finalId = id || Math.random().toString(36).substring(2, 11);
      const result = await db.query(
        `INSERT INTO students (id, name, email, roll_number, grade, section, gender, parent_name, parent_contact, address, date_of_birth, monthly_fee, arrears) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         ON CONFLICT (id) DO UPDATE SET 
         name=$2, email=$3, roll_number=$4, grade=$5, section=$6, gender=$7, parent_name=$8, parent_contact=$9, address=$10, date_of_birth=$11, monthly_fee=$12, arrears=$13
         RETURNING *`,
        [finalId, name, email, rollNumber, grade, section, gender, parentName, parentContact, address, dateOfBirth, monthlyFee, arrears || 0]
      );
      res.status(201).json(toCamelCase(result.rows)[0]);
    } catch (err: any) {
      handleDbError(err, res);
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
      handleDbError(err, res);
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

      const finalId = id || Math.random().toString(36).substring(2, 11);
      
      let result;
      if (passwordHash) {
        result = await db.query(
          `INSERT INTO teachers 
           (id, name, email, contact_number, designation, base_salary, subject, qualification, login_id, password_hash, role, assigned_class, is_teaching) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
           ON CONFLICT (id) DO UPDATE SET 
           name=$2, email=$3, contact_number=$4, designation=$5, base_salary=$6, subject=$7, qualification=$8, login_id=$9, password_hash=$10, role=$11, assigned_class=$12, is_teaching=$13
           RETURNING *`,
          [finalId, name, email, contactNumber, designation, baseSalary, subject, qualification, loginId, passwordHash, role, assignedClass, isTeaching]
        );
      } else {
        result = await db.query(
          `INSERT INTO teachers 
           (id, name, email, contact_number, designation, base_salary, subject, qualification, login_id, role, assigned_class, is_teaching) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
           ON CONFLICT (id) DO UPDATE SET 
           name=$2, email=$3, contact_number=$4, designation=$5, base_salary=$6, subject=$7, qualification=$8, login_id=$9, role=$10, assigned_class=$11, is_teaching=$12
           RETURNING *`,
          [finalId, name, email, contactNumber, designation, baseSalary, subject, qualification, loginId, role, assignedClass, isTeaching]
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
      handleDbError(err, res);
    }
  });

  app.post("/api/fees", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    const { id, studentId, amount, paymentDate, month, year, status } = req.body;
    try {
      const finalId = id || Math.random().toString(36).substring(2, 11);
      const result = await db.query(
        `INSERT INTO fee_records (id, student_id, amount, payment_date, month, year, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO UPDATE SET 
         amount=$3, payment_date=$4, month=$5, year=$6, status=$7
         RETURNING *`,
        [finalId, studentId, amount, paymentDate, month, year, status]
      );
      res.status(201).json(toCamelCase(result.rows)[0]);
    } catch (err) {
      handleDbError(err, res);
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
      handleDbError(err, res);
    }
  });

  app.post("/api/transactions", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    const { id, type, category, amount, description, date, month, year, studentId } = req.body;
    try {
      const finalId = id || Math.random().toString(36).substring(2, 11);
      const result = await db.query(
        `INSERT INTO transactions (id, type, category, amount, description, date, month, year, student_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO UPDATE SET 
         type=$2, category=$3, amount=$4, description=$5, date=$6, month=$7, year=$8, student_id=$9
         RETURNING *`,
        [finalId, type, category, amount, description, date, month, year, studentId]
      );
      res.status(201).json(toCamelCase(result.rows)[0]);
    } catch (err) {
      handleDbError(err, res);
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
      handleDbError(err, res);
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
      handleDbError(err, res);
    }
  });

  app.post("/api/inventory", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    const { id, itemName, category, purchasePrice, salePrice, stockQuantity, unit, minQuantity } = req.body;
    try {
      const finalId = id || Math.random().toString(36).substring(2, 11);
      const result = await db.query(
        `INSERT INTO inventory (id, item_name, category, purchase_price, sale_price, stock_quantity, unit, min_quantity) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT (id) DO UPDATE SET 
         item_name=$2, category=$3, purchase_price=$4, sale_price=$5, stock_quantity=$6, unit=$7, min_quantity=$8
         RETURNING *`,
        [finalId, itemName, category, purchasePrice, salePrice, stockQuantity, unit, minQuantity]
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
        try {
          settingsMap[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
        } catch {
          settingsMap[row.key] = row.value;
        }
      });
      res.json(settingsMap);
    } catch (err) {
      handleDbError(err, res);
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
      handleDbError(err, res);
    }
  });

  // Payroll
  app.get("/api/payroll", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    try {
      const result = await db.query("SELECT * FROM payroll ORDER BY payment_date DESC");
      res.json(toCamelCase(result.rows));
    } catch (err) {
      handleDbError(err, res);
    }
  });

  app.post("/api/payroll", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    const { id, teacherId, amount, paymentDate, month, year, status } = req.body;
    try {
      const finalId = id || Math.random().toString(36).substring(2, 11);
      const result = await db.query(
        `INSERT INTO payroll (id, teacher_id, amount, payment_date, month, year, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO UPDATE SET 
         teacher_id=$2, amount=$3, payment_date=$4, month=$5, year=$6, status=$7
         RETURNING *`,
        [finalId, teacherId, amount, paymentDate, month, year, status]
      );
      res.status(201).json(toCamelCase(result.rows)[0]);
    } catch (err) {
      handleDbError(err, res);
    }
  });

  // Catch-all for undefined API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Auto-initialize tables
  const db = getPool();
  if (db) {
    try {
      console.log("Checking database schema...");
      const schemaPath = path.join(process.cwd(), "schema.sql");
      const sql = fs.readFileSync(schemaPath, "utf8");
      
      await db.query(sql);
      console.log("Database initialized/updated successfully.");

      // Seed default principal if not exists
      const checkRes = await db.query("SELECT * FROM teachers WHERE login_id = $1", ["jahanzeb"]);
      if (checkRes.rows.length === 0) {
        const passHash = await bcrypt.hash("123", 10);
        await db.query(
          `INSERT INTO teachers (id, name, email, role, login_id, password_hash, designation, is_teaching) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          ["admin_default", "Muhammad Jahanzeb", "principal@alnaseeha.edu", "principal", "jahanzeb", passHash, "Principal", false]
        );
        console.log("Default principal account created: [jahanzeb / 123]");
      }
    } catch (err: any) {
      console.error("Database initialization failed:", err.message);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (PostgreSQL Mode)`);
  });
}

function handleDbError(err: any, res: express.Response) {
  console.error("Database operation failed:", err.message);
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({ 
      error: "Database connection failed", 
      message: "The database server is currently unreachable. Please check your connection or database status.",
      code: err.code 
    });
  }
  res.status(500).json({ error: "Internal Server Error", message: err.message });
}

startServer();
