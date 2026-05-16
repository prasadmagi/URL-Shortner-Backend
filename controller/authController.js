const bcrypt = require("bcrypt");
const prisma = require("../config/database");
const { signUpSchema, logInSchema } = require("../validation/authValidation");
const { generateToken } = require("../utils/helpers");

const SALT_ROUNDS = 10;

const signUp = async (req, res) => {
  try {
    const result = signUpSchema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error?.issues?.[0]?.message || "Validation failed";
      return res.status(400).json({ error: errorMessage });
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

const logIn = async (req, res) => {
  try {
    const result = logInSchema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error?.issues?.[0]?.message || "Validation failed";
      return res.status(400).json({ error: errorMessage });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { signUp, logIn };
