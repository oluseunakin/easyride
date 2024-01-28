import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { getSession, getUserId, ss } from "~/session.server";
import type { BasicVendor, Location } from "~/types";
import { Spinner } from "~/components/Spinner";
import { VendorComponent } from "~/components/Vendor";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return userId;
  throw redirect("login");
};

export const action = async ({ request }: ActionArgs) => {
  const fd = await request.formData();
  const lat = Number(fd.get("lat") as string);
  const long = Number(fd.get("long") as string);
  const session = await getSession(request);
  session.set("location", { lat, long });
  await ss.commitSession(session);
  return json("Location set", {
    headers: {
      "Set-Cookie": await ss.commitSession(session),
    },
  });
};

export default function Index() {
  const userId = useLoaderData<typeof loader>();
  const [location, setLocation] = useState<Location>();
  const [nearbyVendors, setNearbyVendors] = useState<BasicVendor[]>([]);
  const sendLocationFetcher = useFetcher();
  const getNearbyVendorsFetcher = useFetcher();
  const [count, setCount] = useState(0);
  const nearbyVendorDivRef = useRef<HTMLDivElement>(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const preservedScrollPosition = useRef(0);

  useEffect(() => {
    if (nearbyVendors.length > 0 && count > 0) {
      window.scrollTo(0, preservedScrollPosition.current);
    }
  }, [nearbyVendors, count]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          setLocation({
            lat,
            long,
          });
        },
        (error) => {
          console.log(error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (
      location &&
      sendLocationFetcher.state === "idle" &&
      sendLocationFetcher.data == undefined
    ) {
      sendLocationFetcher.submit(location, { method: "post" });
    }
  }, [location, sendLocationFetcher]);

  useEffect(() => {
    if (
      getNearbyVendorsFetcher.state === "idle" &&
      sendLocationFetcher.data &&
      !getNearbyVendorsFetcher.data &&
      location
    ) {
      getNearbyVendorsFetcher.load(`localvendors/${count}`);
    }
  }, [getNearbyVendorsFetcher, location, sendLocationFetcher.data, count]);

  useEffect(() => {
    if (
      getNearbyVendorsFetcher.state === "idle" &&
      getNearbyVendorsFetcher.data
    ) {
      const vendors = getNearbyVendorsFetcher.data.vendors;
      setNearbyVendors((prev) => [...prev, ...vendors]);
      setCount((count) => count + 1);
      setFetchingMore(false);
    }
  }, [getNearbyVendorsFetcher.data, getNearbyVendorsFetcher.state]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting && count > 0) {
            setFetchingMore(true);
            preservedScrollPosition.current = window.scrollY;
            getNearbyVendorsFetcher.load(`localvendors/${count}`);
          }
        });
      },
      { root: null, threshold: 0.7 }
    );
    const nearbyVendorDiv = nearbyVendorDivRef.current;
    nearbyVendorDiv && observer.observe(nearbyVendorDiv);
    return () => {
      observer.disconnect();
    };
  }, [count, getNearbyVendorsFetcher]);

  return (
    <>
      {getNearbyVendorsFetcher.state === "loading" ? (
        <div className="mx-auto w-max">
          <Spinner width="w-14" height="h-14" />
        </div>
      ) : (
        <>
          {nearbyVendors.length > 0 ? (
            <div
              className="mx-auto flex w-11/12 flex-col"
              ref={nearbyVendorDivRef}
            >
              {fetchingMore ? (
                <div className="mx-auto w-max">
                  <Spinner width="w-10" height="h-10" />
                </div>
              ) : (
                nearbyVendors?.map((nv, i) => (
                  <VendorComponent key={i} vendor={nv} userId={userId} />
                ))
              )}
            </div>
          ) : (
            <div className="mx-auto my-2 flex w-11/12 flex-col items-center justify-center gap-10 text-center">
              <h2 className="break-words text-4xl text-red-700">
                <p className="mb-4">Need a Service or Products delivered? </p>
                <p>
                  You need a platform to showcase your services or tell locals
                  what you offer?
                </p>
              </h2>
              <h3 className="text-3xl text-red-500">
                Click on the links above or Search for a service you want
              </h3>
            </div>
          )}
        </>
      )}
    </>
  );
}
