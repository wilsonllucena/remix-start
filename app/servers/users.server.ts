import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";

export const createUser = async ({email, password, firstName, lastName}: any) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: passwordHash,
      profile: {
        firstName: firstName,
        lastName: lastName,
      },
    },
  });

  return { id: newUser.id, email: newUser.email };
};
