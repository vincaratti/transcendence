import 'reflect-metadata';
import { MikroORM, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import {User} from './entities/User';

async function main() {
  const orm = await MikroORM.init({
    driver: SqliteDriver,
    dbName: 'transcendence.db',
    entities: [User],
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