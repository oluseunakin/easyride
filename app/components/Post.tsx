import { dateFormatter } from "~/helper";
import { MediaComponent } from "./Media";
import { useFetcher, useOutletContext } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CommentComponent } from "./Comment";
import type { Comment, Prisma } from "@prisma/client";
import type { comment } from "~/models/post.server";
import type { Context } from "~/types";

export function PostComponent(props: {
  post: any;
  userId: string;
  username: string;
  offerer: boolean;
  vendorId: number;
}) {
  const { post, userId, username, offerer, vendorId } = props;
  const commentFetcher = useFetcher<
    { post: { comments: Comment[] } } | Comment
  >();
  const likeFetcher = useFetcher();
  const [like, setLike] = useState(0);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [hasCommented, setHasCommented] = useState(false);
  const [newComment, setNewComment] =
    useState<Prisma.PromiseReturnType<typeof comment>>();
  const [comments, setComments] = useState<Comment[]>([]);
  const { setModalState } = useOutletContext<Context>();
  //const divRef = useRef<HTMLDivElement>(null);
  const hasLiked = useMemo(
    () =>
      post.likes
        ? Boolean(
            post.likes.find(
              (l: { name: string; id: string }) => l.id === userId
            )
          )
        : false,
    [post.likes, userId]
  );
  const liked = likeFetcher.formData
    ? Number(likeFetcher.formData.get("like") as string) == 1
    : hasLiked;
  const d = new Date(post.createdAt);

  useEffect(() => {
    if (likeFetcher.state === "idle" && likeFetcher.data) {
      setLike(likeFetcher.data._count.likes);
    }
  }, [likeFetcher.data, likeFetcher.state]);

  useEffect(() => {
    if (
      hasCommented &&
      commentFetcher.state === "idle" &&
      commentFetcher.data
    ) {
      setNewComment(commentFetcher.data as any);
    }
  }, [commentFetcher.data, commentFetcher.state, hasCommented]);

  useEffect(() => {
    if (
      commentFetcher.state === "idle" &&
      commentFetcher.data &&
      !hasCommented
    ) {
      const postFromCommentFetcher = (
        commentFetcher.data as unknown as { post: { comments: any[] } }
      ).post;
      postFromCommentFetcher.comments.length > 0 &&
        setComments(postFromCommentFetcher.comments);
    }
  }, [
    commentFetcher,
    comments,
    hasCommented,
    offerer,
    post.id,
    setModalState,
    userId,
    username,
    vendorId,
  ]);

  useEffect(() => {
    if (newComment) setComments((comments) => [...comments, newComment]);
  }, [newComment]);

  useEffect(() => {
    if (commentFetcher.state === "idle" && commentFetcher.data) {
      setModalState({
        data: (
          <div className="h-9/10">
            <div className="flex h-9/10 flex-col gap-4 overflow-auto bg-slate-100 p-3">
              {comments.length > 0 ? (
                comments.map((c, i) => <CommentComponent key={i} comment={c} />)
              ) : (
                <div className="flex justify-center text-3xl">
                  No Comments yet
                </div>
              )}
            </div>
            <textarea
              ref={commentRef}
              className="m-4 w-11/12 rounded-md border p-2"
              placeholder="Press enter key to add comment"
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  commentFetcher.submit(
                    {
                      comment: commentRef.current!.value.trim(),
                      commentor: offerer ? vendorId : username,
                    },
                    {
                      method: "post",
                      action: `post/${post.id}`,
                      encType: "multipart/form-data",
                    }
                  );
                  setHasCommented(true);
                  commentRef.current!.value = "";
                }
              }}
            ></textarea>
          </div>
        ),
      });
    }
  }, [
    commentFetcher,
    comments,
    offerer,
    post.id,
    setModalState,
    username,
    vendorId,
  ]);

  return (
    <div className="rounded-md bg-slate-800 p-2 px-4 text-slate-200 shadow-xl shadow-slate-300">
      {post.media.length > 0 && (
        <div className="flex justify-center p-2">
          <MediaComponent sources={post.media} />
        </div>
      )}
      <p className="mt-2 first-letter:capitalize">{post.content}</p>
      <div className="mt-3">
        <likeFetcher.Form
          action={`/vendor/${vendorId}/post/${post.id}`}
          method="post"
          className="float-left"
        >
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
            {liked ? (
              <span className="material-symbols-outlined liked align-top text-green-500">
                sentiment_satisfied
              </span>
            ) : (
              <span className="material-symbols-outlined align-top text-green-500">
                sentiment_satisfied
              </span>
            )}
          </button>
        </likeFetcher.Form>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setModalState({
                data: (
                  <div className="h-9/10 bg-slate-100">
                    <div className="flex flex-wrap items-center pt-4">
                      <p className="mx-2">liked by</p>
                      {post.likes.map(
                        (like: { id: string; name: string }, i: number) => (
                          <p key={i} className="mr-2 text-red-600">
                            {like.name}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ),
              });
            }}
          >
            <span>{post._count.likes}</span>
            <span className="material-symbols-outlined align-middle text-green-500">
              sentiment_satisfied
            </span>
          </button>
          <button
            onClick={() => {
              commentFetcher.load(
                `/vendor/${vendorId}/post/${post.id}/?comment=yes`
              );
            }}
          >
            <span>{post._count.comments}</span>
            <span className="material-symbols-outlined align-middle text-green-500">
              comment
            </span>
          </button>
        </div>
      </div>
      <div className="text-xs">
        <span className="mr-1">{dateFormatter(d.getMonth())}</span>
        <span>{d.getDate()}</span>
        <span>,</span>
        <span className="ml-2">{d.getFullYear()}</span>
      </div>
    </div>
  );
}
