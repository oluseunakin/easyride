import type { User } from "@prisma/client";
import { prisma } from "~/db.server";

export const findUser = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      id: true,
      offering: { select: { name: true, serviceName: true, id: true } },
      myRequests: {select: {
        name: true,
        about: true,
        service: true,
        offerer: {select: {name: true}},
        lat: true,
        long: true,
        contact: true,
        id: true,
        cover: true
      }},
    },
  });
};

export const createUser = async (user: User) => {
  await prisma.user.create({ data: { id: user.id, name: user.name } });
};