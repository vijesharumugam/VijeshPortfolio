const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "12h"
  });

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const adminUsername = process.env.ADMIN_USERNAME || "Vijesh";
  const adminPassword = process.env.ADMIN_PASSWORD || "Vijesh26@1";
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";

  const isUsernameValid = username === adminUsername;
  const isPasswordValid = adminPasswordHash
    ? await bcrypt.compare(password, adminPasswordHash)
    : password === adminPassword;

  if (!isUsernameValid || !isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({ username: adminUsername, role: "admin" });

  return res.json({
    message: "Login successful",
    token,
    admin: { username: adminUsername, role: "admin" }
  });
};

const getSession = (req, res) => {
  return res.json({ admin: req.admin });
};

module.exports = { loginAdmin, getSession };
