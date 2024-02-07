import type { LoaderArgs } from "@remix-run/node";
import { findUserRequestsPosts } from "~/models/user.server";
import { getUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const count = Number(params.count);
  const take = 10;
  return (
    await findUserRequestsPosts(userId!, count, take)
  )?.myRequests.flatMap((requestedVendor) => requestedVendor.posts);
};
