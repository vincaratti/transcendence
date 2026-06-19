import { MikroORM, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property({ nullable: false })
  username!: string;

  @Property({ nullable: false })
  email!: string;

  @Property({ nullable: false })
  passwordHash!: string;

  @Property()
  createdAt?: Date = new Date();
}