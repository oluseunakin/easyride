import { Link, useOutletContext } from "@remix-run/react";
import EditableSelect from "~/components/EditableSelect";
import type { context } from "~/types";

export default function OfferingServices() {
  const { user } = useOutletContext<context>();
  const offeringServices = user!.offering;
  const goto = offeringServices?.map((o) => `/welcome/vendor/${o.id}`);
  const listClicked = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    window.location.href = e.currentTarget.getAttribute("goto")!;
  };
  if (offeringServices.length > 0) {
    return (
      <div className="p-2">
        <div className="mx-auto max-w-sm">
          <EditableSelect
            list={offeringServices.map((o) => o.name)}
            goto={goto}
            listClicked={listClicked}
            placeholder="Find your favourite Provider"
          />
        </div>
        <div className="my-4 flex flex-col items-center gap-5">
          {offeringServices.map((service, i) => (
            <Link
              to={`/welcome/vendor/${service.id}`}
              key={i}
              className="mx-auto w-4/5 rounded-sm bg-slate-700 p-10 text-white md:w-3/5"
            >
              <h1 className="text-center font-serif text-2xl uppercase sm:text-3xl md:text-4xl">
                {service.name}
              </h1>
              <h2 className="text-center font-mono text-2xl">
                {service.serviceName}
              </h2>
            </Link>
          ))}
        </div>
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
