import express from 'express';
import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { User } from './entities/User';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

let orm: any;

async function main() {
  orm = await MikroORM.init({
    driver: SqliteDriver,
    dbName: "transcendence.db",
    entities: [User],
    allowGlobalContext: true,
  });

  await orm.getSchemaGenerator().updateSchema();
  console.log("Database ready");

// rm later
  app.get("/", (req, res) => {
    res.json({ message: "API is running" });
  });

// [REGISTER]

  app.post("/register", async (req, res) => 
  {
    const { username, email, password } = req.body;

    if (!username || !email || !password) 
      {
        return res.status(400).json(
          { 
            error: "All fields are required"
          });
      }

    try {
      const em = orm.em.fork();

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

// [LOGIN]

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const em = orm.em.fork();
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

  app.listen(3000, () => {
    console.log("Server on http://localhost:3000");
  });
}

main().catch(console.error);