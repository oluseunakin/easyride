import type { GetResult } from "@prisma/client/runtime";
import { json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData, useOutletContext } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Post } from "~/components/Post";
import { VendorHeadComponent } from "~/components/Vendor";
import { storeMedia } from "~/firebase/firebase";
import { createPost } from "~/models/post.server";
import { getFullVendor, subscribe, unsubscribe } from "~/models/vendor.server";
import { getUserId } from "~/session.server";
import type { FullVendor, Media, context } from "~/types";

export const loader = async ({ params }: LoaderArgs) => {
  const id = Number(params.id);
  try {
    const vendor = await getFullVendor(id);
    return json(vendor);
  } catch (e) {
    return json("Vendor not found");
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await getUserId(request);
  const fd = await request.formData();
  const todo = fd.get("todo") as string;
  const vendorId = Number(params.id);
  if (todo === "post") {
    const description = fd.get("post") as string;
    const media = JSON.parse(fd.get("media") as string) as (GetResult<
      {
        id?: number;
        ct: string;
        url: string;
        postId?: number;
        vendorId?: number;
      },
      { [x: string]: () => unknown }
    > & {})[];
    await createPost({ media, description, vendorId });
  } else if (todo === "Request") {
    await subscribe(vendorId, userId);
  } else await unsubscribe(vendorId, userId);
  return null;
};

export default function Vendor() {
  const vendorFromLoader = useLoaderData<FullVendor | string>();
  const { user } = useOutletContext<context>();
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState("");
  const shareRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (media && media.length > 0) {
      setUploading(`Upload successful`);
      shareRef.current!.disabled = false;
    }
  }, [media]);

  if (typeof vendorFromLoader === "string") return <h1>{vendorFromLoader}</h1>;
  else {
    const subscribed = Boolean(
      vendorFromLoader.subscribers.find(
        (subscriber) => subscriber.name === user?.name
      )
    );
    const offerer = Boolean(
      user!.offering.find((offer) => offer.name === vendorFromLoader.name)
    );
    return (
      <div className="mb-2">
        <VendorHeadComponent
          data={vendorFromLoader}
          subscribed={subscribed}
          offerer={offerer}
        />
        {vendorFromLoader.posts && (
          <div className="ml-3 mt-8">
            <hr className="my-4" />
            <div className="flex flex-col gap-12">
              {vendorFromLoader.posts.map((p, i) => (
                <Post key={i} post={p} />
              ))}
            </div>
          </div>
        )}
        {offerer && (
          <Form method="post" className="mt-8">
            <div className="ml-3 flex items-center gap-2">
              <textarea
                placeholder="Show workings..."
                name="post"
                className="flex-grow resize-none rounded-sm border p-4"
              ></textarea>
              <label htmlFor="media" className="cursor-pointer">
                Media
              </label>
              <input
                type="file"
                multiple
                hidden
                id="media"
                onChange={async (e) => {
                  const media = e.target.files;
                  shareRef.current!.disabled = true;
                  setUploading("loading");
                  setMedia(
                    await storeMedia(
                      `${vendorFromLoader.id}${Math.floor(
                        Math.random() * 100
                      )}`,
                      media!
                    )
                  );
                }}
              />
              <button
                type="submit"
                name="todo"
                value="post"
                ref={shareRef}
                onClick={() => {
                  setUploading("");
                }}
                className="cursor-pointer"
              >
                Share
              </button>
            </div>
            {uploading === "loading" && (
              <div className="mt-2 flex justify-center">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border border-t-gray-700"></div>
              </div>
            )}
            {uploading === "Upload successful" && (
              <div className="mt-2 flex justify-center text-center text-red-500">
                {uploading}
              </div>
            )}
            <input type="hidden" name="media" value={JSON.stringify(media)} />
          </Form>
        )}
      </div>
    );
  }
}
