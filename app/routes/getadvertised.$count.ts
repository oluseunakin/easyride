import { defer, type LoaderArgs } from "@remix-run/node";
import { getAdvertised } from "~/models/vendor.server";

export const loader = async ({ params }: LoaderArgs) => {
  return defer({ advertised: getAdvertised(Number(params.count)) });
};
