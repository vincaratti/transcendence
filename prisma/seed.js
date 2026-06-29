import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../backend/src/generated/prisma/client.js';

const host = process.env.DB_HOST ?? 'localhost';
const port = process.env.DB_PORT ?? '5433';
const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${host}:${port}/${process.env.POSTGRES_DB}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const achievements = [
    { name: 'First Win',   description: 'Win your first game',      icon: '🏆', condition: '1_win' },
    { name: 'Winner',      description: 'Win 3 games',              icon: '🔥', condition: '3_wins' },
    { name: 'Champion',    description: 'Win 5 games',              icon: '👑', condition: '5_wins' },
    { name: 'Spymaster',   description: 'Win 1 game as spymaster',  icon: '🕵️', condition: '1_spymaster_wins' },
    { name: 'Operative',   description: 'Win 1 game as operative',  icon: '🧠', condition: '1_operative_wins' },
    { name: 'Team Player', description: 'Play 3 games',             icon: '🤝', condition: '3_games' },
    { name: 'Red',         description: 'Win 1 game as red',        icon: '🔴', condition: '1_red_wins' },
    { name: 'Blue',        description: 'Win 1 game as blue',       icon: '🔵', condition: '1_blue_wins' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { condition: achievement.condition },
      update: {},
      create: achievement,
    });
  }

  console.log('Achievements seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
