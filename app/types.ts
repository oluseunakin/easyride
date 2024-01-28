import type { Prisma } from "@prisma/client";
import type { findUser } from "./models/user.server";
import type { getFullVendor, getVendor } from "./models/vendor.server";
import type { getPost } from "./models/post.server";
import type { ReactNode } from "react";
import type { findServiceWithVendors, getAllServices } from "./models/service.server";

export type BasicVendor = Prisma.PromiseReturnType<typeof getVendor>

export type UserWithServices = Prisma.PromiseReturnType<typeof findUser>;

export type PostWithMedia = Prisma.PromiseReturnType<typeof getPost>;

export type FullVendor = Prisma.PromiseReturnType<typeof getFullVendor>;

export type ServiceWithVendors = Prisma.PromiseReturnType<typeof findServiceWithVendors>

export type Message = {
  time: string;
  text: string;
  sender: string;
};

export type ModalState = {
  index: number;
  children: ReactNode[];
};

export type Media = {
  url: string;
  ct: string;
};

export type Location = {
  lat: number;
  long: number;
};

export type Context = {
  allServices: Prisma.PromiseReturnType<typeof getAllServices>
}