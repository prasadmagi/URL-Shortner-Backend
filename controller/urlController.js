const prisma = require("../prismaClient");
const { createUrlSchema } = require("../validation/urlValidation");
const { generateShortCode, formatUrl } = require("../utils/helpers");

const createUrl = async (req, res) => {
  try {
    const result = createUrlSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { longUrl } = result.data;
    const shortCode = generateShortCode();
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";

    // Check if user is authenticated
    if (!req.user) {
      // Anonymous user - check IP limit
      const ipUrlCount = await prisma.url.count({
        where: { ipAddress: clientIp, userId: null },
      });

      if (ipUrlCount >= 2) {
        return res.status(403).json({
          error: "You've reached the 2 URL limit. Now you have to login to create more.",
        });
      }

      // Create anonymous URL
      const url = await prisma.url.create({
        data: {
          shortCode,
          longUrl,
          ipAddress: clientIp,
        },
      });

      return res.status(201).json({
        message: "URL shortened successfully (anonymous)",
        shortUrl: formatUrl(shortCode),
        shortCode,
        longUrl,
        isAnonymous: true,
      });
    }

    // Authenticated user - create with userId
    const url = await prisma.url.create({
      data: {
        shortCode,
        longUrl,
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      message: "URL shortened successfully",
      shortUrl: formatUrl(shortCode),
      shortCode,
      longUrl,
    });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserUrls = async (req, res) => {
  try {
    const urls = await prisma.url.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shortCode: true,
        longUrl: true,
        clicks: true,
        createdAt: true,
      },
    });

    res.status(200).json({ urls });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.status(200).json({
      shortCode: url.shortCode,
      longUrl: url.longUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    if (url.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to delete this URL" });
    }

    await prisma.url.delete({
      where: { shortCode },
    });

    res.status(200).json({ message: "URL deleted successfully" });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    await prisma.url.update({
      where: { shortCode },
      data: { clicks: { increment: 1 } },
    });

    return res.redirect(url.longUrl);
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUrl,
  getUserUrls,
  getUrl,
  deleteUrl,
  redirectUrl,
};
