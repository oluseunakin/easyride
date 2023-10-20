import { defer } from "@remix-run/node";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
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
import { getUserId } from "~/session.server";
import { findUser } from "~/models/user.server";
import type { Location } from "~/types";

export const meta: V2_MetaFunction = () => [{ title: "Connecting Businesses" }];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const allServices = getAllServices();
  const user = await findUser(userId);
  return defer({ user, allServices });
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
  const searchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const listClicked = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const search = e.currentTarget.innerText;
    window.location.href = `/welcome/service/${search}`;
  };

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
  },[]);

  useEffect(() => {
    if (location.lat == 0 && sendLocation.state === "idle" && sendLocation.data === null ) {
      const fd = new FormData();
      fd.append("location", JSON.stringify(location));
      sendLocation.submit(fd, { action: `/setlocation`, method: "post" });
    }
  }, [location, sendLocation]);

  return (
    <div>
      <div className="m-2 mb-14">
        {user && (
          <div className="mb-4 grid auto-cols-fr grid-cols-4">
            <Link
              to="/"
              className="col-span-3 flex gap-2 text-lg sm:justify-center items-center"
            >
              <span className="material-symbols-outlined">
                home
              </span>
              <span>Welcome</span>{" "}
              <b className="text-2xl uppercase tracking-wider text-yellow-700">{user!.name}</b>
            </Link>
            <Link to="/logout" className="flex justify-end text-slate-600">
              <span className="material-symbols-outlined">logout</span>
            </Link>
          </div>
        )}
        <Form
          className="relative mb-5 sm:mx-10"
          method="get"
          action={`/service/${searchValue}`}
        >
          <Suspense fallback={<p>Fetching Servicess</p>}>
            <Await
              resolve={allServices}
              errorElement={<p>Nothing was fetched from server</p>}
            >
              {(allServices) => (
                <EditableSelect
                  list={allServices.map((service: Service) => service.name)}
                  placeholder="What Service do you need?"
                  listClicked={listClicked}
                  textChanged={searchChange}
                  value={searchValue}
                />
              )}
            </Await>
          </Suspense>
          <button type="submit" className="absolute right-2 top-2">
            <span className="material-symbols-outlined">search</span>
          </button>
        </Form>
        <div className="flex justify-center gap-5 sm:justify-around text-lg">
          <div>
            <Link className="text-red-500 uppercase tracking-wide" to="bevendor">
              Become a Provider
            </Link>
          </div>
          <div>
            <Link to="requested" className="text-red-500 uppercase tracking-wide">
              Requested Services
            </Link>
          </div>
          <div>
            <Link to="offering" className="text-red-500 uppercase tracking-wide">
              Offering
            </Link>
          </div>
        </div>
      </div>
      <Outlet context={{ user, allServices, location }} />
    </div>
  );
}