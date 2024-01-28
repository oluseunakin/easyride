import type { LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import EditableSelect from "~/components/EditableSelect";
import { Spinner } from "~/components/Spinner";
import { findUserWithOfferings } from "~/models/user.server";
import { getUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  return defer({ user: findUserWithOfferings(userId) });
};

export default function () {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Suspense
      fallback={
        <div className="mx-auto w-max">
          <Spinner width="w-10" height="h-10" />
        </div>
      }
    >
      <Await resolve={user}>
        {(user) =>
          user && user.offering.length > 0 ? (
            <>
              <div className="mx-auto max-w-sm w-11/12">
                <EditableSelect
                  list={user.offering.map((offer, i) => (
                    <Link key={i} to={`/vendor/${offer.id}`}>
                      {offer.name}
                    </Link>
                  ))}
                  placeholder="Find your favourite Provider"
                />
              </div>
              <div className="my-4 flex flex-col items-center gap-8">
                {user.offering.map((provider, i) => (
                  <Link
                    to={`/vendor/${provider.id}`}
                    key={i}
                    className="mx-auto rounded-lg bg-slate-700 py-6 text-white sm:w-3/5 w-11/12 shadow-lg shadow-slate-100"
                  >
                    <h1 className="mb-2 text-center font-serif text-3xl uppercase leading-loose tracking-widest md:text-4xl">
                      {provider.name}
                    </h1>
                    <h2 className="text-center font-mono text-2xl">
                      {provider.serviceName}
                    </h2>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <Link
                className="bg-blue-800 p-8 text-5xl text-blue-200"
                to="/showyourself"
              >
                Provide Service
              </Link>
            </div>
          )
        }
      </Await>
    </Suspense>
  );
}
