import { defer, type LoaderArgs } from "@remix-run/node";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import EditableSelect from "~/components/EditableSelect";
import { Spinner } from "~/components/Spinner";
import { findUserWithRequests } from "~/models/user.server";
import { getUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  return defer({ user: findUserWithRequests(userId!) });
};

export default function Requested() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Suspense
      fallback={
        <div className="w-max mx-auto">
          <Spinner width="w-10" height="h-10" />
        </div>
      }
    >
      <Await resolve={user}>
        {(user) =>
          user && user.myRequests.length > 0 ? (
            <div className="p-2">
              <div className="mx-auto max-w-sm w-full">
                <EditableSelect
                  list={user.myRequests.map((request, i) => (
                    <Link key={i} to={`/vendor/${request.id}`}>
                      {request.name}
                    </Link>
                  ))}
                  placeholder="Find your favourite Provider"
                />
              </div>
              <div className="my-4 flex flex-col items-center gap-5">
                {user.myRequests.map((provider, i) => (
                  <Link
                    to={`/vendor/${provider.id}`}
                    key={i}
                    className="mx-auto rounded-lg bg-slate-700 py-6 px-4 text-white sm:w-3/5"
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
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <h1 className="text-lg sm:text-2xl md:text-3xl">
                You have not requested for any Service yet
              </h1>
            </div>
          )
        }
      </Await>
    </Suspense>
  );
}
