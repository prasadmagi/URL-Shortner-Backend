const prisma = require("../config/database");

// Get all users with their URL counts
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { urls: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const usersWithUrlCount = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      urlCount: user._count.urls,
    }));

    res.status(200).json({ users: usersWithUrlCount });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user details with their URLs
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        urls: {
          select: {
            id: true,
            shortCode: true,
            longUrl: true,
            clicks: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalClicks = user.urls.reduce((sum, url) => sum + url.clicks, 0);

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      urls: user.urls,
      stats: {
        totalUrls: user.urls.length,
        totalClicks,
      },
    });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get overall stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalUrls, totalClicks, clicksByCountry, topUrls] =
      await Promise.all([
        prisma.user.count(),
        prisma.url.count(),
        prisma.url.aggregate({ _sum: { clicks: true } }),
        prisma.clickAnalytics.groupBy({
          by: ["country"],
          _count: true,
        }),
        prisma.url.findMany({
          orderBy: { clicks: "desc" },
          take: 10,
          select: {
            shortCode: true,
            clicks: true,
            longUrl: true,
            userId: true,
          },
        }),
      ]);

    // Get user info for top URLs
    const topUrlsWithUser = await Promise.all(
      topUrls.map(async (url) => {
        const user = url.userId
          ? await prisma.user.findUnique({
              where: { id: url.userId },
              select: { name: true, email: true },
            })
          : null;
        return {
          shortCode: url.shortCode,
          longUrl: url.longUrl,
          clicks: url.clicks,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    res.status(200).json({
      stats: {
        totalUsers,
        totalUrls,
        totalClicks: totalClicks._sum.clicks || 0,
      },
      clicksByCountry: clicksByCountry
        .filter((c) => c.country) // Remove null countries
        .map((c) => ({ country: c.country, count: c._count })),
      topUrls: topUrlsWithUser,
    });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get URL analytics (just country stats)
const getUrlAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const clicksByCountry = await prisma.clickAnalytics.groupBy({
      by: ["country"],
      where: { urlId: url.id },
      _count: true,
    });

    res.status(200).json({
      shortCode: url.shortCode,
      longUrl: url.longUrl,
      totalClicks: url.clicks,
      clicksByCountry: clicksByCountry
        .filter((c) => c.country)
        .map((c) => ({ country: c.country, count: c._count })),
    });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  getStats,
  getUrlAnalytics,
};