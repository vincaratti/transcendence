import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const host = process.env.DB_HOST ?? "localhost";
const port = process.env.DB_PORT ?? "5433";
const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${host}:${port}/${process.env.POSTGRES_DB}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
