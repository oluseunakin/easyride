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

export const getServiceVendorsAround = async (
  userLocation: Location,
  radius: number,
  count: number,
  take: number,
  serviceName: string
) => {
  function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }
  const { lat, long } = userLocation;
  const offset = count * take;
  const extendedPrisma = prisma.$extends({
    result: {
      vendor: {
        distance: {
          needs: { lat: true, long: true },
          compute(vendor) {
            const lat1 = lat;
            const lon1 = long;
            const lat2 = vendor.lat;
            const lon2 = vendor.long;
            const dLat = toRadians(lat2 - lat1);
            const dLon = toRadians(lon2 - lon1);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) *
                Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = 6371 * c; // Radius of the Earth in kilometers
            return distance;
          },
        },
      },
    },
  });
  return await extendedPrisma.$queryRaw`
  SELECT
    *,
    2 * 6371 * ASIN(
      SQRT(
        POWER(SIN(RADIANS((${lat} - lat) / 2)), 2) +
        COS(RADIANS(${lat})) * COS(RADIANS(lat)) *
        POWER(SIN(RADIANS((${long} - long) / 2)), 2)
      )
    ) AS distance
  FROM
    "Vendor" v
  WHERE
    2 * 6371 * ASIN(
      SQRT(
        POWER(SIN(RADIANS((${lat} - lat) / 2)), 2) +
        COS(RADIANS(${lat})) * COS(RADIANS(lat)) *
        POWER(SIN(RADIANS((${long} - long) / 2)), 2)
      )
    ) >= ${radius}
    AND v."serviceName" = ${serviceName}
    ORDER BY v."id" ASC
    OFFSET ${offset} ROWS
    FETCH NEXT ${take} ROWS ONLY`;
};

export const getServiceVendors = async (count: number, take: number, name: string) => {
  return await prisma.vendor.findMany({
    take: take,
    skip: count * take,
    orderBy: { id: "asc" },
    include: {
      subscribers: { select: { name: true, id: true } },
      offerer: { select: { name: true } },
      bookings: { select: { bookerName: true } },
    },
    where: {
      service: {
        is: {
          name
        }
      }
    }
  });
};
