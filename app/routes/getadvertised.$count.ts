import { json, type LoaderArgs } from "@remix-run/node";
import { getAdvertised, getAdvertisedNearby } from "~/models/vendor.server";
import { getLocation } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userLocation = await getLocation(request);
  const take = 10;
  const count = Number(params.count);
  const radius = 20;
  if (userLocation) {
    return json({
      advertised: await getAdvertisedNearby(take, count, userLocation, radius),
    });
  }
  return json({ advertised: await getAdvertised(count, take) });
};
