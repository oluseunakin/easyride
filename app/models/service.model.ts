import { prisma } from "~/db.server";
import type { Location } from "~/types";

export const getAllServices = async () => {
  return await prisma.service.findMany({ select: { name: true } });
};

export const findService = async (name: string) => {
  return prisma.service.findUniqueOrThrow({ where: { name } });
};

export const findServiceName = async (name: string) => {
  return prisma.service.findUniqueOrThrow({
    where: { name },
    select: { name: true },
  });
};

export const findServiceWithVendors = async (
  name: string,
  coords?: Location
) => {
  if (coords) {
    return prisma.service.findUnique({
      where: { name },
      include: {
        vendors: {
          include: { contact: true, cover: true },
          where: {
            AND: [
              {
                AND: [
                  { lat: { gte: coords.minLat } },
                  { lat: { lte: coords.maxLat } },
                ],
              },
              {
                AND: [
                  { long: { gte: coords.minLong } },
                  { long: { lte: coords.maxLong } },
                ],
              },
            ],
          },
        },
      },
    });
  }
  return prisma.service.findUnique({
    where: { name },
    include: {
      vendors: { include: { contact: true, cover: true } },
    },
  });
};
