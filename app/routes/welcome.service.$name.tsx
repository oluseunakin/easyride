import type { Service } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import {
  Await,
  useLoaderData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import { Suspense, useMemo } from "react";
import { VendorHeadComponent } from "~/components/Vendor";
import { usSorted } from "~/helper";
import { findServiceWithVendors } from "~/models/service.model";
import { getLocation } from "~/session.server";
import type { ServiceWithVendors, context } from "~/types";

export const loader = async ({ params, request }: LoaderArgs) => {
  const name = params.name as string;
  const coords = await getLocation(request);
  const service = await findServiceWithVendors(name, coords);
  if (service == null) {
    return null;
  }
  return defer(service);
};

export default function Service() {
  const { name } = useParams();
  const { location, user } = useOutletContext<context>();
  const { minLat, maxLat, minLong, maxLong } = location;
  const service = useLoaderData<ServiceWithVendors | null>();
  const sortedVendors = useMemo(() => {
    if (service == null) return [];
    return usSorted(service!.vendors, minLat, maxLat, minLong, maxLong);
  }, [minLat, maxLat, minLong, maxLong, service]);

  if (!service)
    return (
      <h1 className="mt-8 text-center text-3xl">Service not found, Oops!</h1>
    );

  return (
    <div className="flex flex-col gap-20">
      <h1 className="mt-5 flex flex-wrap items-baseline justify-center gap-2  text-center text-slate-900">
        <span className="text-xl">Welcome to</span>{" "}
        <b className="font-serif text-4xl">{name}</b>
      </h1>
      <div>
        <Suspense fallback={<p>Loading</p>}>
          <Await resolve={service} errorElement={<p>Error getting Service</p>}>
            {(service) =>
              sortedVendors.map((vendor, i) => {
                const vendorId: number = vendor.id;
                const subscribed = Boolean(
                  user!.myRequests.find((request) => request.id == vendorId)
                );
                const offering = Boolean(
                  user!.offering.find((offer) => offer.id == vendorId)
                );
                return (
                  <div key={i} className="mx-auto mb-12 w-4/5">
                    <VendorHeadComponent
                      data={vendor}
                      subscribed={subscribed}
                      offerer={offering}
                    />
                  </div>
                );
              })
            }
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
