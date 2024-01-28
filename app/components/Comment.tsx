import { dateFormatter } from "~/helper";

export const CommentComponent = (props: { comment: any }) => {
  const { comment } = props;
  const d = new Date(comment.createdAt);
  return (
    <div className="rounded-md border p-2 shadow bg-white">
      <p className="m-2">{comment.content}</p>
      <p className="flex gap-1 text-xs">
        <span>comment by</span>
        <span>{comment.vendor ? comment.vendor.name : comment.user.name}</span>
        <span>{dateFormatter(d.getMonth())}</span>
        <span>{d.getDate()}</span>
        <span>{d.getFullYear()}</span>
      </p>
    </div>
  );
};
