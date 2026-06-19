"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = initDB;
exports.getORM = getORM;
const core_1 = require("@mikro-orm/core");
const sqlite_1 = require("@mikro-orm/sqlite");
const User_1 = require("../entities/User");
let orm;
async function initDB() {
    orm = await core_1.MikroORM.init({
        driver: sqlite_1.SqliteDriver,
        dbName: "transcendence.db",
        entities: [User_1.User],
        allowGlobalContext: true,
    });
    await orm.getSchemaGenerator().updateSchema();
    console.log("Database ready");
    return orm;
}
function getORM() {
    return orm;
}
