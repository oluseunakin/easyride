import { Link, useOutletContext } from "@remix-run/react";
import type { context } from "~/types";

export default function OfferingServices() {
  const { user } = useOutletContext<context>();
  const offeringServices = user!.offering;
  if (offeringServices.length > 0) {
    return (
      <div className="flex flex-col items-center gap-5 mb-4">
        {offeringServices.map((service, i) => (
          <Link
            to={`/welcome/vendor/${service.id}`}
            key={i}
            className="mx-auto w-4/5 rounded-sm bg-slate-700 p-10 text-white md:w-3/5"
          >
            <h1 className="text-center font-serif text-2xl sm:text-3xl md:text-4xl uppercase">
              {service.name}
            </h1>
            <h2 className="text-center text-2xl font-mono">{service.serviceName}</h2>
          </Link>
        ))}
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <Link
        className="bg-blue-100 p-4 text-2xl text-blue-800"
        to="/welcome/bevendor"
      >
        Provide Service
      </Link>
    </div>
  );
}
