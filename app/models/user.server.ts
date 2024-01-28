import type { User } from "@prisma/client";
import { prisma } from "~/db.server";

export const findUser = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id }
  });
};

export const findUserWithRequests = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id }, include: {myRequests: {select: {id: true, name: true, serviceName: true}}}
  });
};

export const findUserWithOfferings = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id }, include: {offering: {select: {id: true, name: true, serviceName: true}}}
  });
};

export const createUser = async (user: User) => {
  await prisma.user.create({ data: { id: user.id, name: user.name } });
};