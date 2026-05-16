const redis = require("../config/redis");

const rateLimiter = (windowSeconds = 60, maxRequests = 5) => {
  return async (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const key = `ratelimit:${ip}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - current));

      if (current > maxRequests) {
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (error) {
      // If Redis fails, allow the request through
      next();
    }
  };
};

module.exports = { rateLimiter };