/* eslint-disable @typescript-eslint/no-unused-vars */
import { cssBundleHref } from "@remix-run/css-bundle";
import { defer } from "@remix-run/node";
import type {
  V2_MetaFunction,
  LinksFunction,
  LoaderArgs,
} from "@remix-run/node";
import {
  Await,
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import customSheet from "~/styles/custom.css";
import { getUserId } from "./session.server";
import { findUser } from "./models/user.server";
import { Suspense, useEffect, useRef, useState } from "react";
import EditableSelect from "./components/EditableSelect";
import { getAllServices } from "./models/service.server";
import { Spinner } from "./components/Spinner";
import type { Prisma } from "@prisma/client";
import { io } from "socket.io-client";
import { getAdvertised, getAdvertisedCount } from "./models/vendor.server";
import { VendorComponent } from "./components/Vendor";
import type { BasicVendor } from "./types";
import { prisma } from "./db.server";

export const meta: V2_MetaFunction = () => [{ title: "Connecting Businesses" }];

export const socket = io("https://providersconnectchatserver.onrender.com");

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div>An Error Has Occured</div>
        {isRouteErrorResponse(error) && <div>{error.data}</div>}
        <Scripts />
      </body>
    </html>
  );
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: customSheet },
  {
    rel: "stylesheet",
    as: "image",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
  },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const advertised = getAdvertised(0);
  const advertisedCount = await getAdvertisedCount();
  if (userId) {
    const allServices = getAllServices();
    const user = await findUser(userId);
    return defer({ user, allServices, advertised, advertisedCount });
  }
  return defer({ user: null, allServices: [], advertised, advertisedCount });
};

export default function App() {
  const { user, allServices, advertised, advertisedCount } =
    useLoaderData<typeof loader>();
  const allServicesRef =
    useRef<Prisma.PromiseReturnType<typeof getAllServices>>();
  const [searchValue, setSearchValue] = useState("");
  const path = useLocation().pathname;
  const asideRef = useRef<HTMLElement>(null);
  const getMoreAdvertisedFetcher = useFetcher();
  const [advertisedState, setAdvertisedState] = useState([advertised]);
  const [count, setCount] = useState(1);
  const [connected, setConnected] = useState(false);

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries[0].isIntersecting &&
          getMoreAdvertisedFetcher.load(`getadvertised/${count}`);
      },
      { root: null, threshold: 0.7 }
    );
    advertisedCount > 0 && observer.observe(asideRef.current!);
    return () => {
      observer.disconnect();
    };
  }, [count, getMoreAdvertisedFetcher, advertisedCount]);

  useEffect(() => {
    if (
      getMoreAdvertisedFetcher.state === "idle" &&
      getMoreAdvertisedFetcher.data
    ) {
      setCount((count) => count++);
      setAdvertisedState((advertisedState) => [
        ...advertisedState,
        getMoreAdvertisedFetcher.data.advertised,
      ]);
    }
  }, [getMoreAdvertisedFetcher.data, getMoreAdvertisedFetcher.state]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-100">
        {path !== "/login" && (
          <>
            <header className="">
              {user && (
                <div className="mb-4 flex items-center bg-red-900 p-3 text-white">
                  <Link
                    to="/"
                    className="flex flex-grow items-center gap-2 text-lg"
                  >
                    <span className="material-symbols-outlined">home</span>
                    <b className="text-2xl uppercase tracking-wider">
                      {user!.name}
                    </b>
                  </Link>
                  <div>
                    <Link
                      to="/logout"
                      className="flex justify-end text-slate-100"
                    >
                      <span className="material-symbols-outlined">logout</span>
                    </Link>
                  </div>
                </div>
              )}
            </header>
            <div className="sticky top-0 z-40 bg-slate-100 mb-2 pb-6">
              <Form
                className="relative mx-auto mb-5 w-11/12 max-w-md pt-2"
                action={`/service/${searchValue}`}
              >
                <Suspense fallback={<Spinner width="w-10" height="h-10" />}>
                  <Await
                    resolve={allServices}
                    errorElement={<p>Nothing was fetched from server</p>}
                  >
                    {(allServices) => {
                      allServicesRef.current = allServices;
                      return (
                        <EditableSelect
                          list={allServices.map((service, i) => (
                            <Link key={i} to={`service/${service.name}`}>
                              {service.name}
                            </Link>
                          ))}
                          placeholder="What Service do you need?"
                          textChanged={setSearchValue}
                          value={searchValue}
                        />
                      );
                    }}
                  </Await>
                </Suspense>
                <button type="submit" className="absolute right-2 top-2">
                  <span className="material-symbols-outlined">search</span>
                </button>
              </Form>
              <nav className="flex flex-wrap justify-around gap-2 text-2xl sm:justify-around">
                <Link
                  to="offering"
                  className="rounded bg-red-700 px-4 py-2 capitalize text-red-100"
                >
                  What I Offer
                </Link>
                <Link
                  className="rounded bg-red-700 px-4 py-2 capitalize text-red-100"
                  to="showyourself"
                >
                  Provide
                </Link>
                <Link
                  to="requested"
                  className="rounded bg-red-700 px-4 py-2 capitalize text-red-100"
                >
                  Subscribed Providers
                </Link>
              </nav>
            </div>
          </>
        )}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <main className="flex-1 flex-grow">
            <Outlet context={{ allServices: allServicesRef.current }} />
          </main>
          <aside ref={asideRef} className="m-4">
            {advertisedState.map((ad, i) => (
              <Suspense
                key={i}
                fallback={
                  <div className="mx-auto w-max">
                    <Spinner width="w-10" height="h-10" />
                  </div>
                }
              >
                <Await resolve={ad}>
                  {(advertised) =>
                    advertised && advertised.length > 0 ? (
                      <div className="flex w-3/4 flex-col gap-4 md:w-11/12">
                        {advertised.map((advert: BasicVendor, i: number) => (
                          <VendorComponent
                            key={i}
                            vendor={advert}
                            userId={user!.id}
                          />
                        ))}
                      </div>
                    ) : null
                  }
                </Await>
              </Suspense>
            ))}
          </aside>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
