import { dateFormatter } from "~/helper";
import { MediaComponent } from "./Media";
import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CommentComponent } from "./Comment";
import type { Comment } from "@prisma/client";
import { Spinner } from "./Spinner";

export function PostComponent(props: {
  post: any;
  userId: string;
  username: string;
}) {
  const { post, userId, username } = props;
  const likeAndCommentFetcher = useFetcher();
  const [like, setLike] = useState(0);
  const [comment, setComment] = useState(false);
  const [comments, setComments] = useState<Array<Comment>>([]);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef<HTMLDivElement>(null)
  const hasLiked = useMemo(() => post.likes.includes(userId), [post, userId]);
  const liked = likeAndCommentFetcher.formData
    ? Number(likeAndCommentFetcher.formData.get("like") as string) == 1
    : hasLiked;
  const d = new Date(post.createdAt);

  useEffect(() => {
    if (likeAndCommentFetcher.state === "idle" && likeAndCommentFetcher.data) {
      if (likeAndCommentFetcher.data.comments) {
        setComments(likeAndCommentFetcher.data.comments);
      } else if (likeAndCommentFetcher.data.comment) {
        setComments((comments) => [
          ...comments,
          likeAndCommentFetcher.data.comment,
        ]);
      }
    }
  }, [likeAndCommentFetcher.data, likeAndCommentFetcher.state]);

  useEffect(() => {
    if(divRef.current) {
      divRef.current.scrollIntoView()
    }
  })

  useEffect(() => {
    comment && likeAndCommentFetcher.load(`post/${post.id}/?comment=yes`);
  }, [comment, post.id])

  return (
    <div className="rounded-md bg-white p-2 shadow-xl">
      {post.media.length > 0 && <MediaComponent sources={post.media} />}
      <p className="mb-1 mt-2 first-letter:capitalize">{post.description}</p>
      <div className="m-1 mt-3 flex gap-4">
        {post._count.comments >= 0 && (
          <button
            onClick={() => {
              setComment(!comment);
            }}
          >
            <span>{post._count.comments}</span>
            <span className="material-symbols-outlined align-middle text-green-900">
              comment
            </span>
          </button>
        )}
        {post.likes.length >= 0 && (
          <likeAndCommentFetcher.Form action={`post/${post.id}`} method="post">
            <input type="hidden" name="todo" value="like" />
            <input type="hidden" name="userid" value={userId} />
            <button
              type="submit"
              name="like"
              value={like}
              onClick={() => {
                if (liked) setLike(0);
                else setLike(1);
              }}
            >
              <span>{post.likes.length}</span>
              {liked ? (
                <span className="material-symbols-outlined liked align-top text-green-800">
                  sentiment_satisfied
                </span>
              ) : (
                <span className="material-symbols-outlined align-top text-green-800">
                  sentiment_satisfied
                </span>
              )}
            </button>
          </likeAndCommentFetcher.Form>
        )}
      </div>
      <div className="text-xs">
        <span className="mr-1">{dateFormatter(d.getMonth())}</span>
        <span>{d.getDate()}</span>
        <span>,</span>
        <span className="ml-2">{d.getFullYear()}</span>
      </div>
      {comment && (
        <div className="mx-auto mt-4 w-4/5">
          {likeAndCommentFetcher.state === "submitting" ? (
            <div className="flex justify-center">
              <Spinner width="w-10" height="h-10" />
            </div>
          ) : (
            <div className="mb-4 flex flex-col gap-2" ref={divRef}>
              {comments.map((c, i) => (
                <CommentComponent key={i} comment={c} />
              ))}
            </div>
          )}
          <textarea
            ref={commentRef}
            className="w-full rounded-md border p-2"
            placeholder="Press enter key to add comment"
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                likeAndCommentFetcher.submit(
                  {
                    comment: commentRef.current!.value.trim(),
                    userid: userId,
                    username: username,
                  },
                  {
                    method: "post",
                    action: `post/${post.id}`,
                    encType: "multipart/form-data",
                  }
                );
                commentRef.current!.value = "";
              }
            }}
          ></textarea>
        </div>
      )}
    </div>
  );
}
