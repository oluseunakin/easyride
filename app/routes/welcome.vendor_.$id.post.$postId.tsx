import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { PostComponent } from "~/components/Post";
import { prisma } from "~/db.server";
import type { context } from "~/types";

export const loader = async ({ params, request }: LoaderArgs) => {
  const postId = Number(params.postId);
  const getComments = new URL(request.url).searchParams.get("comment")
  if(getComments) {
    return await prisma.post.findUnique({where: {id: postId}, select: {comments: true}})
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { media: true, _count: { select: { comments: true } } },
  });
  if (post) return post;
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const fd = await request.formData();
  const todo = fd.get("todo");
  const userId = fd.get("userid") as string;
  const username = fd.get("username") as string
  const postId = Number(params.postId);
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (todo === "like") {
    const like = fd.get("like");
    const oldLikes = post!.likes;
    let newLikes: string[];
    if (like === "0") newLikes = oldLikes.filter((id) => id !== userId);
    else newLikes = [...oldLikes, userId!];
    await prisma.post.update({
      where: { id: postId },
      data: { likes: { set: newLikes } },
    });
  } else {
    const comment = fd.get("comment") as string
    const newComment = await prisma.comment.create({data: {comment, commentorName: username, commentor: {connect: {id: userId}}, post: {connect: {
      id: postId
    }}}})
    return json({comment: newComment})
  }
  return null;
};

export default function Post() {
  const post = useLoaderData<typeof loader>();
  const { user } = useOutletContext<context>();
  return post ? (
    <div className="mx-auto w-4/5">
      <PostComponent post={post} userId={user!.id} username={user!.name} />
    </div>
  ) : (
    <h1>Post not found</h1>
  );
}
