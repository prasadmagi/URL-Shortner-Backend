const { z } = require("zod");

const createUrlSchema = z.object({
  longUrl: z.string().url("Invalid URL format"),
});

const shortCodeSchema = z.object({
  shortCode: z.string().min(1, "Short code is required"),
});

module.exports = { createUrlSchema, shortCodeSchema };
