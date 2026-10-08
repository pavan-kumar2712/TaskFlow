const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const secret = process.env.JWT_SECRET || "taskflow_change_this_secret";

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (existing.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hashed]
    );

    res.status(201).json({
      message: "Registration successful",
      userId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [rows] = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [(email || "").trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password || "", user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      secret,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login };
