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
  useRouteError,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import customSheet from "~/styles/custom.css";
import { getUserId } from "./session.server";
import { findUser } from "./models/user.server";
import { Suspense, useEffect, useReducer, useRef, useState } from "react";
import EditableSelect from "./components/EditableSelect";
import { getAllServices } from "./models/service.server";
import { Spinner } from "./components/Spinner";
import type { Prisma } from "@prisma/client";
import { io } from "socket.io-client";
import { VendorComponent } from "./components/Vendor";
import type { BasicVendor, ModalState } from "./types";

export const meta: V2_MetaFunction = () => [{ title: "Connecting Businesses" }];

export const socket = io("https://providersconnectchatserver.onrender.com");
//export const socket = io("ws://localhost:5000");

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
  if (userId) {
    const allServices = getAllServices();
    const user = await findUser(userId);
    return defer({ user, allServices });
  }
  return defer({ user: null, allServices: [] });
};

export default function App() {
  const { user, allServices } = useLoaderData<typeof loader>();
  const allServicesRef =
    useRef<Prisma.PromiseReturnType<typeof getAllServices>>();
  const [searchValue, setSearchValue] = useState("");
  const asideRef = useRef<HTMLElement>(null);
  const getAdvertisedFetcher = useFetcher();
  const [advertisements, setAdvertisements] = useState<BasicVendor[]>([]);
  const [count, setCount] = useState(0);
  const [modalState, setModalState] = useReducer(
    (state: ModalState, action: any): ModalState => {
      if (action.type === "close") return { index: -1, children: [] };
      else if (action.type === "back") {
        const children = [...state.children];
        children.pop();
        return { index: state.index - 1, children };
      } else
        return {
          index: state.index + 1,
          children: [...state.children, action.data],
        };
    },
    { index: -1, children: [] }
  );

  useEffect(() => {
    if (
      count == 0 &&
      getAdvertisedFetcher.state === "idle" &&
      !getAdvertisedFetcher.data
    ) {
      getAdvertisedFetcher.load(`getadvertised/${count}`);
    }
  }, [count, getAdvertisedFetcher]);

  /* useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && count != 0) {
            getAdvertisedFetcher.load(`getadvertised/${count}`);
          }
        });
      },
      { root: null, threshold: 0.7 }
    );
    asideRef.current && observer.observe(asideRef.current);
    return () => {
      observer.disconnect();
    };
  }, [count, getAdvertisedFetcher]);  */

  useEffect(() => {
    if (getAdvertisedFetcher.state === "idle" && getAdvertisedFetcher.data) {
      setCount((count) => count + 1);
      setAdvertisements((advertisedState) => [
        ...advertisedState,
        ...getAdvertisedFetcher.data.advertised,
      ]);
    }
  }, [getAdvertisedFetcher.data, getAdvertisedFetcher.state]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-100">
        <header className=" flex items-center bg-slate-900 p-2 text-white">
          <Link to="/" className="flex flex-grow items-center gap-2 text-lg">
            <span className="material-symbols-outlined">home</span>
            {user && (
              <b className="text-2xl uppercase tracking-wider">{user!.name}</b>
            )}
          </Link>
          {user ? (
            <div>
              <Link to="/logout" className="flex justify-end text-slate-400">
                <span className="material-symbols-outlined">logout</span>
              </Link>
            </div>
          ) : (
            <div className="flex justify-end gap-4">
              <Link to="signup" className="bg-red-500 px-4 py-2 text-white">
                Sign Up
              </Link>
              <Link to="login" className="bg-blue-500 px-4 py-2 text-white">
                Login
              </Link>
            </div>
          )}
        </header>
        {user && (
          <header className="sticky top-0 z-40 mb-2 bg-slate-100 pb-6">
            <Form
              className="mx-auto mb-5 flex max-w-md pt-2 w-11/12"
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
              <button type="submit" className="-ml-8">
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
          </header>
        )}

        <div className="m-2 mt-4 flex flex-col-reverse gap-4 md:flex-row">
          <main className="flex-1 flex-grow">
            <Outlet
              context={{
                allServices: allServicesRef.current,
                userId: user?.id,
                userName: user?.name,
                modalState,
                setModalState,
              }}
            />
          </main>
          <aside ref={asideRef} className="mx-auto w-11/12 md:w-1/4">
            {advertisements.length > 0 ? (
              <div className="flex flex-col gap-4">
                {advertisements.map((vendor, i) => (
                  <VendorComponent
                    vendor={vendor}
                    userId={user!.id}
                    key={vendor!.id}
                  />
                ))}
                {getAdvertisedFetcher.state === "loading" && (
                  <div className="mx-auto w-max">
                    <Spinner width="w-10" height="h-10" />
                  </div>
                )}
              </div>
            ) : (
              <p className="mx-auto flex justify-center bg-white px-6 py-8 text-3xl shadow">
                Ads here
              </p>
            )}
          </aside>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
