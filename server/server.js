import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/auth.js";


console.log("DB USER:", process.env.DB_USER);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Campus Connect API running");
});
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);


// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, department, year } = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM students WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Insert user
    const newUser = await pool.query(
      `INSERT INTO students (name, email, password, department, year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email`,
      [name, email, hashedPassword, department, year]
    );

    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Login Route
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    console.log("Email from frontend:", email);
    console.log("Password from frontend:", password);

    const user = await pool.query(
      "SELECT * FROM students WHERE LOWER(email) = $1",
      [email]
    );

    console.log("User from DB:", user.rows);

    if (user.rows.length === 0) {
      console.log("❌ User NOT found");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    console.log("Password match result:", validPassword);

    if (!validPassword) {
      console.log("❌ Password NOT matching");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful");

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/students/:id", authenticateToken, async (req, res) => {
  try {
    const student = await pool.query(
      "SELECT id, name, email, department, year FROM students WHERE id = $1",
      [req.params.id]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/students/:id", authenticateToken, async (req, res) => {
  try {
    const { name, department, year } = req.body;

    const updated = await pool.query(
      `UPDATE students
       SET name = $1, department = $2, year = $3
       WHERE id = $4
       RETURNING id, name, email, department, year`,
      [name, department, year, req.params.id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/students/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM students WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
