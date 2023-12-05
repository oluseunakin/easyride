import type { LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData, useOutletContext } from "@remix-run/react";
import { Suspense, useMemo } from "react";
import { Spinner } from "~/components/Spinner";
import { VendorHeadComponent } from "~/components/Vendor";
import { usSorted } from "~/helper";
import { getAdvertisedVendors } from "~/models/vendor.server";
import { getLocation } from "~/session.server";
import type { context } from "~/types";

export const loader = async ({ request }: LoaderArgs) => {
  const coords = await getLocation(request);
  const advertised = getAdvertisedVendors(coords);
  return defer({ advertised });
};

export default function Index() {
  const { advertised } = useLoaderData<typeof loader>();
  const { user, location } = useOutletContext<context>();
  const { minLat, maxLat, maxLong, minLong } = location;
  const sortedAdvertised = useMemo(
    async () => usSorted(await advertised, minLat, maxLat, minLong, maxLong),
    [advertised, minLat, maxLat, minLong, maxLong]
  );
  const sortedRequests = useMemo(
    () => usSorted(user!.myRequests, minLat, maxLat, minLong, maxLong),
    [minLat, maxLat, minLong, maxLong, user]
  );
  return (
    <div>
      <div>
        {user &&
          sortedRequests.map((vendor, i) => (
            <div key={i} className="mx-auto mb-6 w-5/6 md:w-4/5">
              <VendorHeadComponent data={vendor} subscribed />
            </div>
          ))}
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Spinner width="w-20" height="h-20" />
          </div>
        }
      >
        <Await
          resolve={sortedAdvertised}
          errorElement={<p>Nothing was fetched from server</p>}
        >
          {(advertised) =>
            advertised.map((a, i: number) => {
              const subscribed = Boolean(
                user!.myRequests.find((req) => req.name === a.serviceName)
              );
              return (
                <div key={i} className="mx-auto mb-6 w-4/5 md:w-3/5">
                  <VendorHeadComponent data={a} subscribed={subscribed} />
                </div>
              );
            })
          }
        </Await>
      </Suspense>
    </div>
  );
}
