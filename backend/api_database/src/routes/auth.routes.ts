import { Router } from "express";
import bcrypt from "bcrypt";
import { getORM } from "../utils/db";
import { User } from "../entities/User";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const em = getORM().em.fork();

    const existingUsername = await em.findOne(User, { username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exist" });
    }

    const existingEmail = await em.findOne(User, { email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = em.create(User, {
      username,
      email,
      passwordHash: hashedPassword,
    });

    await em.persistAndFlush(user);
    res.status(201).json({ message: "User Created", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const em = getORM().em.fork();
    const user = await em.findOne(User, { username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;