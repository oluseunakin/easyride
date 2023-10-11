import { redirect } from "@remix-run/node";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { getUserId } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "Connecting Businesses" }];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)
  if (userId) {
    return redirect("/welcome")
  }
  return redirect("/login")
};

