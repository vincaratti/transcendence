import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    {
      name: 'First Win',
      description: 'Win your first game',
      icon: '🏆',
      condition: '1_win',
    },
    {
      name: 'Winner',
      description: 'Win 3 games',
      icon: '🔥',
      condition: '3_wins',
    },
    {
      name: 'Champion',
      description: 'Win 5 games',
      icon: '👑',
      condition: '5_wins',
    },
    {
      name: 'Spymaster',
      description: 'Win 1 games as spymaster',
      icon: '🕵️',
      condition: '1_spymaster_wins',
    },
    {
      name: 'Operative',
      description: 'Win 1 games as operative',
      icon: '🧠',
      condition: '1_operative_wins',
    },
    {
      name: 'Team Player',
      description: 'Play 3 games',
      icon: '🤝',
      condition: '3_games',
    },
    {
      name: 'Red',
      description: 'Win 1 games as red',
      icon: '🔴',
      condition: '1_red_wins',
    },
    {
      name: 'blue',
      description: 'Win 1 games as blue',
      icon: '🔵',
      condition: '1_blue_wins',
    },
  ];

  for (const achievement of achievements)
  {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }

  console.log('Achievements seeded');
}

main().catch(console.error);
