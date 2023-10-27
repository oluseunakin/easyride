import { Form, Link } from "@remix-run/react";
import { useMemo } from "react";
import type { FullVendor } from "~/types";
import { MediaComponent } from "./Media";
import { Post } from "./Post";
import type { Media } from "@prisma/client";

export const VendorHeadComponent = (props: {
  data: any;
  subscribed?: boolean;
  offerer?: boolean;
}) => {
  const { data, subscribed, offerer } = props;
  const refinedCover = useMemo(
    () =>
      data!.cover
        ? data!.cover.map((c: Media) => ({ ct: c.ct, url: c.url }))
        : [],
    [data]
  );
  const contact = data!.contact as {
    phone: string | null;
    email: string | null;
    website: string | null;
    open: string | null;
    close: string | null;
  };
  const eAddress = useMemo(
    () =>
      Object.entries(contact).filter(
        (c) => c[0] === "phone" || c[0] === "email" || c[0] === "website"
      ),
    [contact]
  );
  const restAddress = useMemo(
    () =>
      Object.entries(contact).filter(
        (c) =>
          c[0] !== "phone" &&
          c[0] !== "email" &&
          c[0] !== "website" &&
          c[0] !== "id"
      ),
    [contact]
  );
  return (
    <div className="bg-white shadow-lg shadow-slate-800">
      <div className="p-2">
        <MediaComponent sources={refinedCover} />
      </div>
      <Link to={`/welcome/vendor/${data.id}`} className="block mb-4 mt-5">
        <h1 className="text-center text-4xl capitalize text-red-500 md:text-5xl">
          {data.name}
        </h1>
      </Link>
      {offerer ? null : subscribed ? (
        <Form
          className="mx-auto mb-2 w-fit"
          action={`/welcome/vendor/${data.id}`}
          method="post"
        >
          <input
            type="submit"
            name="todo"
            value="Cancel"
            className="cursor-pointer rounded-md bg-red-700 px-3 py-1 text-white"
          />
        </Form>
      ) : (
        <Form
          className="mx-auto mb-2 w-fit"
          action={`/welcome/vendor/${data.id}`}
          method="post"
        >
          <input
            type="submit"
            name="todo"
            value="Request"
            className="cursor-pointer rounded-md bg-red-700 px-3 py-1 text-white"
          />
        </Form>
      )}
      {contact && (
        <div className="mb-1 flex flex-wrap justify-center gap-2">
          {eAddress.map((c, i) => (
            <p key={i} className="text-slate-800">
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
              <p className="text-center text-slate-800" key={i}>
                {c[1]}
              </p>
            ))}
        </div>
      )}
      <p className="pb-4 text-center">{data.about}</p>
    </div>
  );
};

export const Vendor = (props: {
  data: FullVendor;
  subscribed: boolean;
  offerer: boolean;
}) => {
  const { data, subscribed, offerer } = props;
  return (
    <div>
      <VendorHeadComponent
        data={data}
        subscribed={subscribed}
        offerer={offerer}
      />
      {data.posts.length > 0 && (
        <div>
          {data.posts.map((post, i) => (
            <Post key={i} post={null} />
          ))}
        </div>
      )}
    </div>
  );
};
