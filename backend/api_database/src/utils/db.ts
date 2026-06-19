import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { User } from "../entities/User";

let orm: MikroORM;

export async function initDB() 
{
  orm = await MikroORM.init({
    driver: SqliteDriver,
    dbName: "transcendence.db",
    entities: [User],
    allowGlobalContext: true,
  });
  await orm.getSchemaGenerator().updateSchema();
  console.log("Database ready");
  return orm;
}

export function getORM() {
  return orm;
}