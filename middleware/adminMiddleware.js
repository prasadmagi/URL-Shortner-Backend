const { authMiddleware } = require("./authMiddleware");

const adminMiddleware = (req, res, next) => {
  // First run auth middleware to verify token
  authMiddleware(req, res, () => {
    // Check if user is admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
};

module.exports = { adminMiddleware };