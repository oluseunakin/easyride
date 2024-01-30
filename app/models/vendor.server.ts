//import type { Booking } from "@prisma/client";
import { prisma } from "~/db.server";
import { hashParties } from "~/helper";
import type { Location, Media } from "~/types";
import OpenAI from "openai";
import type { Vendor } from "@prisma/client";

export const getSynonymsFromOpenAI = async (serviceName: string) => {
  const synonyms: string[] = [];
  const ai = new OpenAI({ apiKey: process.env.OENAI_API_KEY });
  const stream = await ai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      { role: "system", content: "You provide synonyms" },
      { role: "user", content: "Tailor" },
      { role: "assistant", content: "Fashion Designer" },
      { role: "user", content: serviceName },
    ],
    max_tokens: 64,
  });
  for await (const chunk of stream) {
    const synonym = chunk.choices[0].delta.content;
    console.log(synonym);
    synonym && synonyms.push(synonym);
  }
  return synonyms;
};

export const createVendor = async (
  name: string,
  userId: string,
  about: string = "",
  serviceName: string,
  contact: any,
  coord?: Location,
  cover?: Media[]
) => {
  return await prisma.vendor.create({
    data: {
      name,
      about,
      service: {
        connect: { name: serviceName },
      },
      lat: coord ? coord.lat : 0,
      long: coord ? coord.long : 0,
      offerer: {
        connect: { id: userId },
      },
      cover,
      contact,
    },
    select: { id: true },
  });
};

export const getVendorsNearby = async (
  userLocation: Location,
  radius: number,
  count: number,
  take: number
) => {
  const { lat, long } = userLocation;
  const offset = count * take
  return await prisma.$queryRaw<Vendor[]>`WITH VendorDistances AS (
    SELECT
      v."id",
      v.name,
      v.about,
      v."serviceName",
      v.lat,
      v.long,
      v.contact,
      v."offererId",
      v.cover, 
      2 * 6371 * ASIN(
        SQRT(
          POWER(SIN(RADIANS((${lat} - v.lat) / 2)), 2) +
          COS(RADIANS(${lat})) * COS(RADIANS(v.lat)) *
          POWER(SIN(RADIANS((${long} - v.long) / 2)), 2)
        )
      ) AS distance
    FROM
      "Vendor" v
  )
  SELECT
    vd.id,
    vd.name,
    vd.about,
    vd."serviceName",
    vd.lat,
    vd.long,
    vd.contact,
    vd."offererId",
    vd.cover,
    vd.distance,
    subscribers."id" 
  FROM
    VendorDistances vd
  LEFT JOIN 
    "_requests" sr ON sr."B" = vd.id
  LEFT JOIN 
    "User" subscribers ON subscribers."id" = sr."A"
  /* WHERE 
     vd.distance <= ${radius}  */
  ORDER BY vd.id ASC
  OFFSET ${offset} ROWS
  FETCH NEXT ${take} ROWS ONLY
  `;
};

export const getVendors = async (count: number, take: number) => {
  return await prisma.vendor.findMany({
    take: take,
    skip: count * take,
    orderBy: {id: "asc"},
    include: {
      subscribers: { select: { name: true, id: true } },
      offerer: { select: { name: true } },
      bookings: { select: { bookerName: true } },
    },
  });
};

export const getFullVendor = async (id: number) => {
  return await prisma.vendor.findUnique({
    where: { id },
    include: {
      posts: {
        take: 10,
        include: {
          _count: { select: { comments: true, likes: true } },
          likes: { select: { id: true, name: true } },
        },
        orderBy: { vendorId: "desc" },
      },
      subscribers: { select: { name: true, id: true } },
      offerer: { select: { name: true } },
      bookings: { select: { bookerName: true } },
    },
  });
};

export const getVendor = async (id: number) => {
  return await prisma.vendor.findUnique({
    where: { id },
    include: { subscribers: true },
  });
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
  const hashedId = hashParties(userId) + vendorId;
  await prisma.chat.delete({ where: { id: hashedId } });
};

export const getAdvertised = async (count: number) => {
  return await prisma.vendor.findMany({
    where: { advert: true },
    take: 10,
    skip: 10 * count,
    include: {
      subscribers: { select: { name: true, id: true } },
      offerer: { select: { name: true } },
      bookings: { select: { bookerName: true } },
    },
  });
};

export const getAdvertisedCount = async () => {
  return await prisma.vendor.count({where: {advert: true}})
}

/* export const checkBookingEveryday = async (id: number) => {
  const todaysDate = new Date().getDate();
  const vendorWithBookings = await prisma.vendor.findUnique({
    where: { id },
    select: { bookings: true },
  });
  const toDelete: Array<Booking> = [];
  vendorWithBookings?.bookings.forEach(async (b) => {
    if (b.dueDate - todaysDate == 0) toDelete.push(b);
  });
  //call email or sms method to notify
  await prisma.vendor.update({
    where: { id },
    data: { bookings: { deleteMany: toDelete } },
  });
}; */
