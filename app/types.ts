import type { Prisma } from "@prisma/client";
import type { findUser } from "./models/user.server";
import type { getFullVendor } from "./models/vendor.server";
//import type { action } from "./routes/getSubscribedVendors";
import type { findServiceWithVendors } from "./models/service.model";
import type { getPost } from "./models/post.server";

export type BasicVendor = Omit<FullVendor, "posts">

export type UserWithServices = Prisma.PromiseReturnType<typeof findUser>;

export type PostWithMedia = Prisma.PromiseReturnType<typeof getPost>;

export type FullVendor = Prisma.PromiseReturnType<typeof getFullVendor>

export type ServiceWithVendors = Prisma.PromiseReturnType<typeof findServiceWithVendors>

export type Contact = Omit<Prisma.ContactUncheckedCreateWithoutVendorInput, "id">

export type context = {
  user: UserWithServices;
  location: Location;
  allServices: Promise<
    {
      name: string;
    }[]
  >;
};

export type Media = {
  url: string;
  ct: string;
}

export type Location = {
  minLat: number;
  maxLat: number;
  lat: number;
  minLong: number;
  maxLong: number;
  long: number;
}
