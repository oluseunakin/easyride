import { type ActionArgs, type LoaderArgs, defer } from "@remix-run/node";
import {
  comment,
  findPostWithComments,
  like,
  unlike,
} from "~/models/post.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const postId = Number(params.postId);
  const getComments = new URL(request.url).searchParams.get("comment");
  if (getComments) {
    const post = findPostWithComments(postId);
    return defer({ post });
  }
  return null
};

export const action = async ({ request, params }: ActionArgs) => {
  const fd = await request.formData();
  const todo = fd.get("todo");
  const postId = Number(params.postId);
  if (todo === "like") {
    const likeNumber = fd.get("like");
    const userId = fd.get("userid") as string;
    if (userId) {
      if (likeNumber === "0") return await unlike(postId, userId);
      else return await like(postId, userId);
    }
  } else {
    const commentor = fd.get("commentor") as string
    const commentorAsVendor = Number(commentor)
    const content = fd.get("comment") as string;
    if(isNaN(commentorAsVendor)) return await comment(postId, content, commentor);
    else return await comment(postId, content, undefined, commentorAsVendor)
  }
  return null;
};