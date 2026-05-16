const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

const generateShortCode = (length = 6) => {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
};

const generateToken = (payload, expiresIn = jwtConfig.expiresIn) => {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    return null;
  }
};

const formatUrl = (shortCode) => {
  const BASE_URL = process.env.BASE_URL || "http://localhost:4000";
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