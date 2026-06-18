import { MikroORM, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  username!: string;

  @Property()
  email!: string;

  @Property()
  passwordHash!: string;

  @Property()
  createdAt?: Date = new Date();
}