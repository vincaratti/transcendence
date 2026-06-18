"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@mikro-orm/core");
const sqlite_1 = require("@mikro-orm/sqlite");
const User_1 = require("./entities/User");
async function main() {
    const orm = await core_1.MikroORM.init({
        driver: sqlite_1.SqliteDriver,
        dbName: 'transcendence.db',
        entities: [User_1.User],
        allowGlobalContext: true,
    });
    await orm.getSchemaGenerator().updateSchema();
    console.log('DATABASE READY');
    //   const em = orm.em.fork();
    //   const user = em.create(User, { username: 'alice', email: 'alice@example.com' });
    //   await em.persistAndFlush(user);
    //   console.log('👤 USER CREATEAD :', user);
    //   const users = await em.find(User, {});
    //   console.log('📋 ALL USERS :', users);
    await orm.close();
}
main().catch(console.error);
