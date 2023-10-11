import { Link, useOutletContext } from "@remix-run/react";
import type { context } from "~/types";
export const base = "http://localhost:3000";

export default function Requested() {
  const { user } = useOutletContext<context>();
  const requested = user?.myRequests;
  if (requested && requested.length > 0) {
    return (
      <div className="mb-4 flex flex-col items-center gap-5">
        {requested.map((request, i) => (
          <div className="w-3/5 bg-slate-900" key={i}>
            <Link
              to={`${base}/welcome/vendor/${request.id}`}
              className="flex flex-col justify-center text-white"
            >
              <p className="text-center text-2xl my-2">{request.service.name}</p>
              <p className="text-center text-4xl mb-6">{request.name}</p>
            </Link>
          </div>
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
