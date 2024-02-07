import type { Service } from "@prisma/client";
import type { LoaderArgs, TypedDeferredData } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, Link, useLoaderData, useParams } from "@remix-run/react";
import { Suspense } from "react";
import EditableSelect from "~/components/EditableSelect";
import { Spinner } from "~/components/Spinner";
import { VendorComponent } from "~/components/Vendor";
import {
  getServiceVendors,
  getServiceVendorsAround,
} from "~/models/service.server";
import { getLocation, getUserId } from "~/session.server";
import type { BasicVendor } from "~/types";

export const loader = async ({ params, request }: LoaderArgs) => {
  const name = params.name as string;
  const coords = await getLocation(request);
  const count = 0;
  const take = 20;
  let vendors = getServiceVendors(count, take, name);
  const radius = 20;
  if (coords)
    return defer({
      vendors: getServiceVendorsAround(coords, radius, count, take, name),
      userId: await getUserId(request),
    });
  return defer({ vendors, userid: await getUserId(request) });
};

export default function Service() {
  const { name } = useParams();
  const { vendors, userid } = useLoaderData<
    Promise<
      TypedDeferredData<{
        vendors: BasicVendor[];
        userid: string;
      }>
    >
  >();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="min-w-xs mx-auto text-center text-red-700">
        <b className="text-4xl">{name}</b>
      </h1>
      <>
        <Suspense
          fallback={
            <div className="mx-auto w-max">
              <Spinner width="w-14" height="h-14" />
            </div>
          }
        >
          <Await resolve={vendors} errorElement={<p>Error getting Service</p>}>
            {(vendors) => (
              <>
                <div className="mx-auto my-4 w-11/12 max-w-md">
                  <EditableSelect
                    list={vendors.map((vendor, i) => (
                      <Link key={i} to={`/vendor/${vendor?.id}`}>
                        {vendor?.name}
                      </Link>
                    ))}
                    placeholder="Find your favourite Provider"
                  />
                </div>
                {vendors.length > 0 ? (
                  vendors.map((vendor, i) => (
                    <VendorComponent key={i} vendor={vendor} userId={userid} />
                  ))
                ) : (
                  <h1 className="mx-auto mt-8 text-center text-5xl">
                    No Vendors{" "}
                  </h1>
                )}
              </>
            )}
          </Await>
        </Suspense>
      </>
    </div>
  );
}
