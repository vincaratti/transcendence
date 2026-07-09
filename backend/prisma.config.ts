import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { defineConfig } from "prisma/config";

const user = process.env["POSTGRES_USER"];
const password = process.env["POSTGRES_PASSWORD"];
const db = process.env["POSTGRES_DB"];
const host = process.env["DB_HOST"] ?? "localhost";
const port = process.env["DB_PORT"] ?? "5433";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: `postgresql://${user}:${password}@${host}:${port}/${db}`,
  },
});
