import "dotenv/config";
import argon2 from "argon2";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.ts";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing in backend/.env");
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });
const passwordRegex = /^(?=.*[A-Z])(?=.*(?:\d|[^\w\s])).{6,}$/;

export async function register(name: string, password: string) {
  if (!name || !password) {
    return {
      success: false,
      message: "Name and password are required",
    };
  }

  if (!passwordRegex.test(password)) {
    return {
      success: false,
      message:
        "Password must have at least 6 characters, 1 uppercase letter, and 1 number or special character",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { name },
  });

  if (existingUser) {
    return {
      success: false,
      message: "User already exists",
    };
  }

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      name,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    message: "User registered successfully",
    user,
  };
}
