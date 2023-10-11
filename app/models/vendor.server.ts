import { prisma } from "~/db.server";
import type { Contact, Location, Media } from "~/types";

export const createVendor = async (
  name: string,
  userId: string,
  about: string = "",
  serviceName: string,
  contact: Contact,
  coord: number[],
  cover?: Media[]
) => {
  const newVendor = await prisma.vendor.create({
    data: {
      name,
      about,
      service: {
        connectOrCreate: {
          where: { name: serviceName },
          create: {
            name: serviceName,
          },
        },
      },
      lat: coord[0],
      long: coord[1],
      offerer: {
        connect: { id: userId },
      },
      cover: {
        createMany: {
          data: cover!.map((file) => ({
            ct: file.ct!,
            url: file.url,
          })),
        },
      },
      contact: {
        create: { ...contact },
      },
    },
  });
  return newVendor.id;
};

export const getAdvertisedVendors = async (coords?: Location) => {
  if (coords)
    return await prisma.vendor.findMany({
      where: {
        advert: true,
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
      include: { contact: true, cover: true },
    });
  return await prisma.vendor.findMany({
    where: { advert: true },
    include: { contact: true, cover: true },
  });
};

export const getFullVendor = async (id: number) => {
  const vendor = await prisma.vendor.findFirstOrThrow({
    where: { id },
    include: {
      posts: { take: 10, include: { media: true } },
      cover: true,
      contact: true,
      subscribers: { select: { name: true } },
      offerer: { select: { name: true } },
    },
  });
  return vendor;
};

export const subscribe = async (vendorId: number, userId: string) => {
  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      subscribers: { connect: { id: userId } },
    },
  });
};

export const unsubscribe = async (vendorId: number, userId: string) => {
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { subscribers: { disconnect: { id: userId } } },
  });
};
