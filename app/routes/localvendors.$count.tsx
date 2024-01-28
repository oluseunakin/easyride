import { defer } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";

import { getVendors, getVendorsNearby } from "~/models/vendor.server";
import { getLocation } from "~/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const userLocation = await getLocation(request);
  const radius = 20;
  const take = 20;
  const count = Number(params.count);
  if (userLocation)
    return defer({
      vendors: getVendorsNearby(userLocation, radius, count, take),
    });
  return defer({ vendors: getVendors(count, take) });
};
