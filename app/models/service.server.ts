import type { Vendor } from "@prisma/client";
import { prisma } from "~/db.server";
import type { Location } from "~/types";

export const createService = async (name: string) => {
  return await prisma.service.create({ data: { name } });
};

export const getAllServices = async () => {
  return await prisma.service.findMany();
};

export const findServiceByName = async (name: string) => {
  return prisma.service.findUniqueOrThrow({ where: { name } });
};

export const findService = async (id: number) => {
  return prisma.service.findUniqueOrThrow({ where: { id } });
};

export const findServiceWithVendors = async (
  name: string,
  userLocation?: Location,
  radius?: number
) => {
  if (userLocation) {
    const { lat, long } = userLocation;
    return await prisma.$queryRaw<Vendor[]>`WITH VendorDistances AS ( 
    SELECT
      id,
      name,
      about,
      "serviceName",
      lat,
      long,
      contact,
      "offererId",
      cover,
      2 * 6371 * ASIN(
        SQRT(
          POWER(SIN(RADIANS((${lat} - lat) / 2)), 2) +
          COS(RADIANS(${lat})) * COS(RADIANS(lat)) *
          POWER(SIN(RADIANS((${long} - long) / 2)), 2)
        )
      ) AS distance
    FROM
      "Vendor"
    WHERE
      "serviceName" = ${name}
  )
  SELECT
    id,
    name,
    about,
    "serviceName",
    lat,
    long,
    contact,
    "offererId",
    cover,
    distance
  FROM
    VendorDistances
  WHERE
    distance <= ${radius}`;
  }
  return (
    await prisma.service.findUnique({
      where: { name },
      include: { vendors: true },
    })
  )?.vendors;
};
