const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Shalini@018",
  database: "node_project",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected!");
});

// JWT secret
const JWT_SECRET = "your_secret_key";

// Helper function to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { username, password, role_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query =
    "INSERT INTO Users (username, password, role_id) VALUES (?, ?, ?)";
  db.query(query, [username, hashedPassword, role_id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: "User registered successfully" });
  });
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM Users WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(400).json({ message: "Invalid username or password" });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid username or password" });

    const token = jwt.sign({ id: user.id, role_id: user.role_id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  });
});

// Create Organization endpoint
app.post("/api/organizations", authenticateJWT, (req, res) => {
  const { name } = req.body;

  const query = "INSERT INTO Organizations (name) VALUES (?)";
  db.query(query, [name], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    const userOrgQuery =
      "INSERT INTO User_Organizations (user_id, organization_id) VALUES (?, ?)";
    db.query(userOrgQuery, [req.user.id, result.insertId], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({
        message: "Organization created and user assigned successfully",
      });
    });
  });
});

// Create Task endpoint
app.post("/api/tasks", authenticateJWT, (req, res) => {
  const { name, description, organization_id } = req.body;

  const query =
    "INSERT INTO Tasks (name, description, organization_id, user_id) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [name, description, organization_id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "Task created successfully" });
    }
  );
});

// Switch Organization endpoint
app.post("/api/switch-organization", authenticateJWT, (req, res) => {
  const { organization_id } = req.body;

  const query =
    "UPDATE Sessions SET current_organization_id = ? WHERE user_id = ?";
  db.query(query, [organization_id, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Organization switched successfully" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
