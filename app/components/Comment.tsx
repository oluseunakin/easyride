import type { Comment } from "@prisma/client";
import { dateFormatter } from "~/helper";

export const CommentComponent = (props: { comment: Comment }) => {
  const { comment } = props;
  const d = new Date(comment.createdAt);
  return (
    <div className="border border-slate-500 p-2 rounded-md">
      <p className="m-2">{comment.comment}</p>
      <p className="flex gap-1 text-xs">
        <span>comment by</span>
        <span>{comment.commentorName}</span>
        <span>{dateFormatter(d.getMonth())}</span>
        <span>{d.getDate()}</span>
        <span>{d.getFullYear()}</span>
      </p>
    </div>
  );
};
