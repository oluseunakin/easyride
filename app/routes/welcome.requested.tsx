import { Link, useOutletContext } from "@remix-run/react";
import EditableSelect from "~/components/EditableSelect";
import type { context } from "~/types";

export default function Requested() {
  const { user } = useOutletContext<context>();
  const requested = user?.myRequests;
  if (requested && requested.length > 0) {
    return (
      <div>
        <EditableSelect list={requested} placeholder="Find your favourite Provider" />
        <div className="mb-4 flex flex-col items-center gap-5">
          {requested.map((provider, i) => (
            <Link
              to={`/welcome/vendor/${provider.id}`}
              key={i}
              className="mx-auto w-4/5 rounded-sm bg-slate-700 p-10 text-white md:w-3/5"
            >
              <h1 className="text-center font-serif text-2xl uppercase sm:text-3xl md:text-4xl">
                {provider.name}
              </h1>
              <h2 className="text-center font-mono text-2xl">
                {provider.service.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-2/5 items-center justify-center">
      <h1 className="text-lg sm:text-2xl md:text-3xl">
        You have not requested for any Service yet
      </h1>
    </div>
  );
}
