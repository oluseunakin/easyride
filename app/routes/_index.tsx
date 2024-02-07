import { json } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { useFetcher, useOutletContext } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { getSession, ss } from "~/session.server";
import { socket } from "~/root";
import { Spinner } from "~/components/Spinner";
import type { BasicVendor, Context, Location } from "~/types";
import type { Post } from "@prisma/client";
import { PostComponent } from "~/components/Post";
import { VendorComponent } from "~/components/Vendor";

export const action = async ({ request }: ActionArgs) => {
  const fd = await request.formData();
  const lat = Number(fd.get("lat") as string);
  const long = Number(fd.get("long") as string);
  const session = await getSession(request);
  session.set("location", { lat, long });
  return json("location set", {
    headers: {
      "Set-Cookie": await ss.commitSession(session),
    },
  });
};

export default function Index() {
  const { userId, userName } = useOutletContext<Context>();
  const [nearbyVendors, setNearbyVendors] = useState<BasicVendor[]>([]);
  const [subscribedPosts, setSubscribedPosts] = useState<Post[]>([]);
  const getNearbyVendorsFetcher = useFetcher();
  const getSubscribedPostsFetcher = useFetcher();
  const [count, setCount] = useState(0);
  const nearbyVendorDivRef = useRef<HTMLDivElement>(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const preservedScrollPosition = useRef(0);
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const [location, setLocation] = useState<Location>();
  const sendLocationFetcher = useFetcher();

  useEffect(() => {
    socket.connect();
    setConnected(true);
    socket.on("connect", () => {
      console.log("Socket has been connected");
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    connected && socket.emit("join", userId);
  }, [connected, userId]);

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
      userId &&
      count == 0 &&
      getNearbyVendorsFetcher.state === "idle" &&
      !getNearbyVendorsFetcher.data
    ) {
      getSubscribedPostsFetcher.load(`subscribedposts/${count}`);
      getNearbyVendorsFetcher.load(`localvendors/${count}`);
    }
  }, [count, getNearbyVendorsFetcher, userId, getSubscribedPostsFetcher]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting && !done && !fetchingMore && count != 0) {
            setFetchingMore(true);
            preservedScrollPosition.current = window.scrollY;
            getSubscribedPostsFetcher.load(`subscribedposts/${count}`);
            getNearbyVendorsFetcher.load(`localvendors/${count}`);
          }
        });
      },
      { root: null, threshold: 0.95 }
    );
    const nearbyVendorDiv = nearbyVendorDivRef.current;
    nearbyVendorDiv && observer.observe(nearbyVendorDiv);
    return () => {
      observer.disconnect();
    };
  }, [
    count,
    getNearbyVendorsFetcher,
    done,
    fetchingMore,
    getSubscribedPostsFetcher,
  ]);

  useEffect(() => {
    if (count > 0) {
      window.scrollTo(0, preservedScrollPosition.current);
    }
  }, [count]);

  useEffect(() => {
    if (
      getSubscribedPostsFetcher.state === "idle" &&
      getSubscribedPostsFetcher.data
    ) {
      const posts = getSubscribedPostsFetcher.data;
      if (posts.length < 1) setDone(true);
      else {
        setSubscribedPosts((prev) => [...prev, ...posts]);
        setCount((count) => count + 1);
      }
      setFetchingMore(false);
    }
  }, [getSubscribedPostsFetcher.data, getSubscribedPostsFetcher.state]);

  useEffect(() => {
    if (
      getNearbyVendorsFetcher.state === "idle" &&
      getNearbyVendorsFetcher.data
    ) {
      const vendors = getNearbyVendorsFetcher.data.vendors;
      if (vendors.length < 1) setDone(true);
      else {
        setNearbyVendors((prev) => [...prev, ...vendors]);
      }
      setFetchingMore(false);
    }
  }, [getNearbyVendorsFetcher.data, getNearbyVendorsFetcher.state]);

  useEffect(() => {
    if (getNearbyVendorsFetcher.data && getSubscribedPostsFetcher.data)
      setCount((count) => count + 1);
  }, [getNearbyVendorsFetcher.data, getSubscribedPostsFetcher.data]);

  const toShow =
    getNearbyVendorsFetcher.state === "loading" ? (
      <div className="mx-auto w-max">
        <Spinner width="w-10" height="h-10" />
      </div>
    ) : (
      <div
        className="mx-auto flex w-11/12 flex-col gap-4"
        ref={nearbyVendorDivRef}
      >
        {nearbyVendors.length + subscribedPosts.length > 0 ? (
          subscribedPosts.map((post, i) => {
            let j = 0;
            if (i == 5 && nearbyVendors.length > 0) {
              const sliced = nearbyVendors.slice(j, j + 2);
              j++;
              return sliced.map((vendor) => (
                <VendorComponent
                  key={vendor?.id}
                  userId={userId}
                  vendor={vendor}
                />
              ));
            }
            return (
              <PostComponent
                key={i}
                offerer={false}
                post={post}
                userId={userId}
                username={userName}
                vendorId={post.vendorId}
              />
            );
          })
        ) : (
          <div className="mx-auto bg-white px-6 py-8 text-center text-3xl shadow">
            <p>Find Vendors around you</p>
            <p>Tell locals what you can do and offer</p>
          </div>
        )}
        {fetchingMore && (
          <div className="mx-auto w-max">
            <Spinner width="w-10" height="h-10" />
          </div>
        )}
      </div>
    );

  if (userId) return toShow;

  return (
    <h2 className="mx-auto mt-8 flex w-11/12 flex-col gap-5 break-words text-center text-4xl text-red-700 md:w-3/5">
      <p className="mb-4">Need Services or Products delivered? </p>
      <p>
        You need a platform to showcase your services or tell locals what you
        offer?
      </p>
      <p>
        Show your awesome products and excellent services to those who need them
        around
      </p>
      <p>Post what you do to your subscribers</p>
    </h2>
  );
}
