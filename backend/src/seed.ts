import argon2 from "argon2";
import { prisma } from "./prisma.ts";

const users = [
  { name: "adam", password: "Adam123" },
  { name: "bartek", password: "Bartek1" },
  { name: "celina", password: "Celina1" },
  { name: "dawid", password: "Dawid12" },
  { name: "ewa", password: "Ewa1234" },
  { name: "filip", password: "Filip12" },
  { name: "gabriela", password: "Gabriela1" },
  { name: "hubert", password: "Hubert1" },
  { name: "iga", password: "Iga1234" },
  { name: "jan", password: "Jan1234" },
  { name: "karolina", password: "Karolina1" },
  { name: "lukasz", password: "Lukasz1" },
  { name: "magda", password: "Magda12" },
  { name: "natalia", password: "Natalia1" },
  { name: "olaf", password: "Olaf123" },
  { name: "patryk", password: "Patryk1" },
  { name: "renata", password: "Renata1" },
  { name: "szymon", password: "Szymon1" },
  { name: "tomasz", password: "Tomasz1" },
  { name: "zosia", password: "Zosia12" },
];

async function seed() {
  for (const user of users) {
    const passwordHash = await argon2.hash(user.password);

    await prisma.user.upsert({
      where: { name: user.name },
      update: { passwordHash },
      create: {
        name: user.name,
        passwordHash,
      },
    });
  }

  console.log(`Seeded ${users.length} users`);
}

try {
  await seed();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
