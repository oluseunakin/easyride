import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const id = Number(params.id);
  const post = await prisma.post.findUnique({
    where: { id },
    include: { media: true },
  });
  if (post) return json(post);
  return null;
};

export default function Post() {
  const post = useLoaderData<typeof loader>();
  if (!post)
    return (
      <h1 className="flex justify-center text-4xl font-bold">Post not found</h1>
    );
  return (
    <div>
      <p></p>
    </div>
  );
}
