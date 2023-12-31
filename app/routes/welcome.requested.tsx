import { Link, useOutletContext } from "@remix-run/react";
import EditableSelect from "~/components/EditableSelect";
import type { context } from "~/types";

export default function Requested() {
  const { user } = useOutletContext<context>();
  const requested = user?.myRequests;
  const goto = requested?.map((r) => `/welcome/vendor/${r.id}`);
  const listClicked = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    window.location.href = e.currentTarget.getAttribute("goto")!;
  };
  if (requested && requested.length > 0) {
    return (
      <div className="p-2">
        <div className="mx-auto max-w-sm">
          <EditableSelect
            list={requested.map((r) => r.name)}
            goto={goto}
            listClicked={listClicked}
            placeholder="Find your favourite Provider"
          />
        </div>
        <div className="my-4 flex flex-col items-center gap-5">
          {requested.map((provider, i) => (
            <Link
              to={`/welcome/vendor/${provider.id}`}
              key={i}
              className="mx-auto rounded-lg bg-slate-700 p-10 text-white md:w-3/5"
            >
              <h1 className="mb-2 text-center font-serif text-3xl uppercase leading-loose tracking-widest md:text-4xl">
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
