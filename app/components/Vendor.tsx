import { Form, Link } from "@remix-run/react";
import { useMemo } from "react";
import { MediaComponent } from "./Media";
import type { BasicVendor, FullVendor, Media } from "~/types";

export const VendorComponent = (props: {
  vendor: FullVendor | BasicVendor;
  userId: string;
}) => {
  const { vendor, userId } = props;
  const subscribed = useMemo(
    () => vendor?.subscribers? vendor?.subscribers.find((v) => v.id === userId) : null,
    [userId, vendor?.subscribers]
  );
  const offerer = useMemo(
    () => vendor?.offererId === userId,
    [userId, vendor?.offererId]
  );
  const eAddress = useMemo(
    () =>
      Object.entries(vendor!.contact!).filter(
        (c) => c[0] === "phone" || c[0] === "email" || c[0] === "website"
      ),
    [vendor]
  );
  const restAddress = useMemo(
    () =>
      Object.entries(vendor!.contact!).filter(
        (c) =>
          c[0] !== "phone" &&
          c[0] !== "email" &&
          c[0] !== "website" &&
          c[0] !== "id"
      ),
    [vendor]
  );
  return (
    <div className="rounded-md bg-slate-900 shadow-lg shadow-slate-400 w-11/12 mx-auto lg:h-3/5 my-5">
      {vendor?.cover && <div className="p-2 flex justify-center">
        <MediaComponent sources={vendor!.cover as Media[]} />
      </div>}
      <Link to={`/vendor/${vendor!.id}`} className="mb-4 mt-5 block">
        <h1 className="text-center text-4xl capitalize text-white md:text-5xl">
          {vendor!.name}
        </h1>
      </Link>
      {offerer ? null : subscribed ? (
        <Form
          className="mx-auto mb-2 w-fit"
          action={`/vendor/${vendor!.id}`}
          method="post"
        >
          <input
            type="submit"
            name="todo"
            value="Cancel"
            className="cursor-pointer rounded-md bg-red-500 px-3 py-1 text-white"
          />
        </Form>
      ) : (
        <Form
          className="mx-auto mb-2 w-fit"
          action={`/vendor/${vendor!.id}`}
          method="post"
        >
          <input
            type="submit"
            name="todo"
            value="Request"
            className="cursor-pointer rounded-md bg-red-500 px-3 py-1 text-white"
          />
        </Form>
      )}
      {eAddress && (
        <div className="mb-1 flex flex-wrap justify-center gap-2 text-center w-10/12 mx-auto">
          {eAddress.map((c, i) => (
            <p key={i} className="font-serif tracking-widest text-red-400">
              {c[1]}
            </p>
          ))}
        </div>
      )}
      {restAddress && (
        <div className="mb-1 flex flex-wrap justify-center gap-2 text-center">
          {restAddress
            .filter((r) => r[0] !== "vendorId")
            .map((c, i) => (
              <p className="text-center text-sm text-red-400" key={i}>
                {c[1]}
              </p>
            ))}
        </div>
      )}
      <p className="pb-4 pl-4 pr-2 text-center lg:mx-auto lg:w-1/2 text-slate-200">
        {vendor!.about}
      </p>
    </div>
  );
};