"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../utils/db");
const User_1 = require("../entities/User");
const router = (0, express_1.Router)();
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const em = (0, db_1.getORM)().em.fork();
        const existingUsername = await em.findOne(User_1.User, { username });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already exist" });
        }
        const existingEmail = await em.findOne(User_1.User, { email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exist" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = em.create(User_1.User, {
            username,
            email,
            passwordHash: hashedPassword,
        });
        await em.persistAndFlush(user);
        res.status(201).json({ message: "User Created", userId: user.id });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }
    try {
        const em = (0, db_1.getORM)().em.fork();
        const user = await em.findOne(User_1.User, { username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const valid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.json({ message: "Login successful", username: user.username });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
