import { dateFormatter } from "~/helper";
import { MediaComponent } from "./Media";

export function Post(props: { post: any }) {
  const { post } = props;
  const d = new Date(post.createdAt);
  if (!post) return <p>Nothing to see here</p>;
  return (
    <div className="shadow-xl p-2 bg-white">
      {post.media.length > 0 && <MediaComponent sources={post.media} />}
      <p className="mb-1 first-letter:capitalize">{post.description}</p>
      <div className="text-base">
        <span className="mr-1">{dateFormatter(d.getMonth())}</span>
        <span>{d.getDate()}</span>
        <span>,</span>
        <span className="ml-2">{d.getFullYear()}</span>
      </div>
    </div>
  );
}
