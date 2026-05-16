const router = require("express").Router();
const { adminMiddleware } = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  getUserDetails,
  getStats,
  getUrlAnalytics,
} = require("../controller/adminController");

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get overall analytics stats (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics
 *       403:
 *         description: Admin access required
 */
router.get("/stats", adminMiddleware, getStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with URL counts (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
router.get("/users", adminMiddleware, getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get specific user details with their URLs (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details with URLs
 *       404:
 *         description: User not found
 */
router.get("/users/:userId", adminMiddleware, getUserDetails);

/**
 * @swagger
 * /api/admin/analytics/{shortCode}:
 *   get:
 *     summary: Get analytics for a specific URL (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL analytics
 *       404:
 *         description: URL not found
 */
router.get("/analytics/:shortCode", adminMiddleware, getUrlAnalytics);

module.exports = router;