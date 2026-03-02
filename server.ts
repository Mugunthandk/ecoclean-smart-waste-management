import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("waste_management.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT,
    area_name TEXT,
    location TEXT,
    lat REAL,
    lng REAL,
    description TEXT,
    image TEXT,
    waste_type TEXT,
    priority TEXT DEFAULT 'Medium',
    suggested_action TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Add columns if they don't exist
try { db.exec("ALTER TABLE complaints ADD COLUMN area_name TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE complaints ADD COLUMN priority TEXT DEFAULT 'Medium'"); } catch(e) {}
try { db.exec("ALTER TABLE complaints ADD COLUMN suggested_action TEXT"); } catch(e) {}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/register", (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)");
      const info = stmt.run(name, email, password, phone);
      res.json({ id: info.lastInsertRowid, name, email, role: 'user' });
    } catch (err: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/complaints", (req, res) => {
    const { user_id, user_name, area_name, location, lat, lng, description, image, waste_type, priority, suggested_action } = req.body;
    const stmt = db.prepare("INSERT INTO complaints (user_id, user_name, area_name, location, lat, lng, description, image, waste_type, priority, suggested_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const info = stmt.run(user_id, user_name, area_name, location, lat, lng, description, image, waste_type, priority, suggested_action);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/complaints", (req, res) => {
    const { user_id, role } = req.query;
    let complaints;
    if (role === 'admin') {
      complaints = db.prepare("SELECT * FROM complaints ORDER BY created_at DESC").all();
    } else {
      complaints = db.prepare("SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC").all(user_id);
    }
    res.json(complaints);
  });

  app.patch("/api/complaints/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE complaints SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const total = db.prepare("SELECT COUNT(*) as count FROM complaints").get() as any;
    const pending = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Pending'").get() as any;
    const completed = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Completed'").get() as any;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'").get() as any;
    res.json({
      total: total.count,
      pending: pending.count,
      completed: completed.count,
      inProgress: inProgress.count
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
