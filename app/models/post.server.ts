import { prisma } from "~/db.server";
import type { Media } from "~/types";

export const getPost = (id: number) => {
  return prisma.post.findUnique({
    where: { id },
    include: { _count: { select: { comments: true } } },
  });
};

export const getPostWithLikes = (id: number) => {
  return prisma.post.findUnique({
    where: { id },
    select: { likes: { select: { id: true } } },
  });
};

export const unlike = async (id: number, userId: string) => {
  return await prisma.post.update({
    where: { id },
    data: { likes: { disconnect: { id: userId } } },
    select: {_count: {select: {likes: true}}}
  });
};

export const like = async (id: number, userId: string) => {
  return await prisma.post.update({
    where: { id },
    data: { likes: { connect: { id: userId } } },
    select: {_count: {select: {likes: true}}}
  });
};

export const comment = async (
  id: number,
  comment: string,
  userId?: string,
  vendorId?: number
) => {
  if (userId)
    return await prisma.comment.create({
      data: {
        content: comment,
        post: { connect: { id } },
        user: { connect: { id: userId } },
      },
      include: {
        vendor: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
  else
    return await prisma.comment.create({
      data: {
        content: comment,
        post: { connect: { id } },
        vendor: { connect: { id: vendorId } },
      },
      include: {
        vendor: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
};

export const createPost = async (post: {
  media: Media[];
  description: string;
  vendorId: number;
}) => {
  return await prisma.post.create({
    data: {
      vendor: { connect: { id: post.vendorId } },
      content: post.description,
      media: post.media,
    },
    select: { id: true },
  });
};

export const findPostWithComments = async (id: number) => {
  return await prisma.post.findUnique({
    where: { id },
    select: {
      comments: {
        include: {
          vendor: { select: { name: true } },
          user: { select: { name: true } },
        },
      },
    },
  });
};
