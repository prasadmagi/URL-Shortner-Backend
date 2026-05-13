const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const generateShortCode = (length = 6) => {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
};

const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const formatUrl = (shortCode) => {
  const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
  return `${BASE_URL}/api/url/${shortCode}`;
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  generateShortCode,
  generateToken,
  verifyToken,
  formatUrl,
  isValidUrl,
};