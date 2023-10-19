import { Link, useOutletContext } from "@remix-run/react";
import type { context } from "~/types";
export const base = "http://localhost:3000";

export default function Requested() {
  const { user } = useOutletContext<context>();
  const requested = user?.myRequests;
  if (requested && requested.length > 0) {
    return (
      <div className="flex flex-col items-center gap-5 mb-4">
        {requested.map((service, i) => (
          <Link
            to={`/welcome/vendor/${service.id}`}
            key={i}
            className="mx-auto w-4/5 rounded-sm bg-slate-700 p-10 text-white md:w-3/5"
          >
            <h1 className="text-center font-serif text-2xl sm:text-3xl md:text-4xl uppercase">
              {service.name}
            </h1>
            <h2 className="text-center text-2xl font-mono">{service.service.name}</h2>
          </Link>
        ))}
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
