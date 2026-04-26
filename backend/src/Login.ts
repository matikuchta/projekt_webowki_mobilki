import argon2 from "argon2";
// @ts-ignore
import { prisma } from './prisma.ts';

export async function login(name: string, password: string) {
  if (!name || !password) {
    return {
      success: false,
      message: "Name and password are required",
    };
  }

  const user = await prisma.user.findUnique({
    where: { name },
    select: {
      id: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Invalid name or password",
    };
  }

  const isPasswordValid = await argon2.verify(user.passwordHash, password);

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid name or password",
    };
  }

  return {
    success: true,
    message: "Logged in successfully",
    user: {
      id: user.id,
      name: user.name,
    },
  };
}
