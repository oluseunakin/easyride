import { defer, json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Suspense, useEffect, useState } from "react";
import {
  Await,
  Form,
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import EditableSelect from "~/components/EditableSelect";
import type { Service } from "@prisma/client";
import { getAllServices } from "~/models/service.model";
import { getSession, getUserId } from "~/session.server";
import { findUser } from "~/models/user.server";
import type { Location } from "~/types";

import { io } from "socket.io-client";

export const meta: V2_MetaFunction = () => [{ title: "Connecting Businesses" }];

export const socket = io("ws://localhost:5000");

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const allServices = getAllServices();
  const user = await findUser(userId);
  return defer({ user, allServices });
};

export const action = async ({ request }: ActionArgs) => {
  const fd = await request.json();
  const coord = fd.location as Location;
  const session = await getSession(request);
  session.set("location", coord);
  return json(null, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
};

export default function Index() {
  const { allServices, user } = useLoaderData<typeof loader>();
  const [location, setLocation] = useState<Location>({
    minLat: 0,
    maxLat: 0,
    minLong: 0,
    maxLong: 0,
    lat: 0,
    long: 0,
  });
  const sendLocation = useFetcher();
  const [searchValue, setSearchValue] = useState("");
  const [connected, setConnected] = useState(false);

  const listClicked = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const search = e.currentTarget.innerText;
    window.location.href = `/welcome/service/${search}`;
  };

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
    connected && socket.emit("join", user?.id);
  }, [connected, user?.id]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          setLocation({
            lat,
            long,
            minLat: lat - 20,
            maxLat: lat + 20,
            minLong: long - 20,
            maxLong: long + 20,
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
      location.lat == 0 &&
      sendLocation.state === "idle" &&
      sendLocation.data === null
    ) {
      sendLocation.submit(JSON.stringify({ location }), {
        action: `/setlocation`,
        method: "post",
        encType: "application/json",
      });
    }
  }, [location, sendLocation]);

  return (
    <div>
      <div className="mb-16">
        {user && (
          <div className="mb-4 flex bg-red-900 p-3 text-white">
            <Link to="/" className="flex flex-grow items-center gap-2 text-lg">
              <span className="material-symbols-outlined">home</span>
              <b className="text-2xl uppercase tracking-wider">{user!.name}</b>
            </Link>
            <Link to="/logout" className="flex justify-end text-slate-100">
              <span className="material-symbols-outlined">logout</span>
            </Link>
          </div>
        )}
        <Form
          className="relative mx-2 mb-5 sm:mx-10"
          method="get"
          action={`/service/${searchValue}`}
        >
          <Suspense
            fallback={
              <EditableSelect list={[]} placeholder="Fetching Services" />
            }
          >
            <Await
              resolve={allServices}
              errorElement={<p>Nothing was fetched from server</p>}
            >
              {(allServices) => (
                <EditableSelect
                  list={allServices.map((service: Service) => service.name)}
                  placeholder="What Service do you need?"
                  listClicked={listClicked}
                  textChanged={setSearchValue}
                  value={searchValue}
                />
              )}
            </Await>
          </Suspense>
          <button type="submit" className="absolute right-2 top-2">
            <span className="material-symbols-outlined">search</span>
          </button>
        </Form>
        <div className="flex flex-wrap justify-around text-2xl sm:justify-around">
          <Link
            to="offering"
            className="capitalize tracking-wide text-red-700 "
          >
            Doings
          </Link>
          <Link
            className="capitalize tracking-wide text-red-700"
            to="bevendor"
          >
            Be A Doer
          </Link>
          <Link
            to="requested"
            className="capitalize tracking-wide text-red-700"
          >
            Doings i like
          </Link>
        </div>
      </div>
      <Outlet context={{ user, allServices, location }} />
    </div>
  );
}
