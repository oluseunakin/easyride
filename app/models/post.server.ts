import type { GetResult } from "@prisma/client/runtime";
import { prisma } from "~/db.server";

export const getPost = (id: number) => {
  return prisma.post.findUnique({ where: { id }, include: { media: true } });
};

export const createPost = async (post: {
  media: GetResult<
    {
      id: number | undefined;
      ct: string;
      url: string;
      postId: number | undefined;
      vendorId: number | undefined;
    },
    { [x: string]: () => unknown }
  >[];
  description: string;
  vendorId: number;
}) => {
  return await prisma.post.create({
    data: {
      vendor: { connect: { id: post.vendorId } },
      description: post.description,
      media: { createMany: { data: post.media } },
    },
  });
};
