import { json, type LoaderArgs } from "@remix-run/node";
import { getVendorsNearby, getVendors } from "~/models/vendor.server";
import { getLocation, getUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const userLocation = await getLocation(request);
  const radius = 20;
  const take = 20;
  const count = Number(params.count)
  if (userLocation)
    return json({
      vendors: await getVendorsNearby(userLocation, radius, count, take, userId!),
      userId,
    });
  return json({ vendors: await getVendors(count, take, userId!), userId });
};
