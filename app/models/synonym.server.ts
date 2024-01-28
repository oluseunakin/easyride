import { prisma } from "~/db.server";

export const findSynonym = async (name: string) => {
  return await prisma.synonym.findUnique({
    where: { name },
    select: { service: { select: { name: true } } },
  });
};
