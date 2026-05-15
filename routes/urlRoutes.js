const router = require("express").Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  createUrl,
  getUserUrls,
  getUrl,
  deleteUrl,
  redirectUrl,
} = require("../controller/urlController");

/**
 * @swagger
 * /api/url:
 *   post:
 *     summary: Create a short URL (anonymous - max 2 per IP)
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - longUrl
 *             properties:
 *               longUrl:
 *                 type: string
 *                 example: https://google.com
 *     responses:
 *       201:
 *         description: URL created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Limit reached, please login
 */

/**
 * @swagger
 * /api/url/auth:
 *   post:
 *     summary: Create a short URL (authenticated)
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - longUrl
 *             properties:
 *               longUrl:
 *                 type: string
 *                 example: https://google.com
 *     responses:
 *       201:
 *         description: URL created successfully
 */
router.post("/auth", authMiddleware, createUrl);

/**
 * @swagger
 * /api/url/my/urls:
 *   get:
 *     summary: Get all URLs for logged in user
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's URLs
 */
router.get("/my/urls", authMiddleware, getUserUrls);

/**
 * @swagger
 * /api/url/{shortCode}/info:
 *   get:
 *     summary: Get URL details
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         example: abc123
 *     responses:
 *       200:
 *         description: URL details
 *       404:
 *         description: URL not found
 */
router.get("/:shortCode/info", authMiddleware, getUrl);

/**
 * @swagger
 * /api/url/{shortCode}:
 *   delete:
 *     summary: Delete a URL
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         example: abc123
 *     responses:
 *       200:
 *         description: URL deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: URL not found
 */
router.delete("/:shortCode", authMiddleware, deleteUrl);

/**
 * @swagger
 * /api/url:
 *   post:
 *     summary: Create a short URL (anonymous - max 2 per IP)
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - longUrl
 *             properties:
 *               longUrl:
 *                 type: string
 *                 example: https://google.com
 *     responses:
 *       201:
 *         description: URL created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Limit reached, please login
 */
router.post("/", createUrl);

// Public - Redirect to long URL
router.get("/:shortCode", redirectUrl);

module.exports = router;