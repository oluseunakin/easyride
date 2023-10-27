import type { GetResult } from "@prisma/client/runtime";
import { json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
//import { Calender } from "~/components/Calendar";
import { Post } from "~/components/Post";
import { VendorHeadComponent } from "~/components/Vendor";
import { storeMedia } from "~/firebase/firebase";
import { createPost } from "~/models/post.server";
import { getFullVendor, subscribe, unsubscribe } from "~/models/vendor.server";
import { getUserId } from "~/session.server";
import type { FullVendor, Media, context } from "~/types";
import { socket } from "./welcome";

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
  } else if (todo === "Cancel") await unsubscribe(vendorId, userId);
  else {
  }
  return null;
};

export default function Vendor() {
  const vendorFromLoader = useLoaderData<FullVendor | string>();
  const { user } = useOutletContext<context>();
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState("");
  const shareRef = useRef<HTMLButtonElement>(null);
  const [book, setBook] = useState({ showBookDiv: false, booked: false });
  const bookAppointment = useFetcher();
  const bookRef = useRef<HTMLInputElement>(null);
  const [showInbox, setShowInbox] = useState(false);
  const messageRef = useRef<HTMLInputElement>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (media && media.length > 0) {
      setUploading(`Upload successful`);
      shareRef.current!.disabled = false;
    }
  }, [media]);

  if (typeof vendorFromLoader === "string") return <h1>{vendorFromLoader}</h1>;
  else {
    socket.emit("join", `${vendorFromLoader.id}`);
    socket.on("msg from receiver", (msg: string) => {
      setHasNewMessage(true);
    });
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
        {/* <div className="mx-auto w-fit">
          <Calender/>
        </div> */}
        <div>
          {offerer ? (
            <Link to="/inbox">
              <span className="material-symbols-outlined">inbox</span>
              {hasNewMessage && (
                <span className="material-symbols-outlined">star</span>
              )}
            </Link>
          ) : (
            <button
              onClick={() => {
                setShowInbox(true);
              }}
            >
              <span className="material-symbols-outlined">inbox</span>
            </button>
          )}
          {offerer ? (
            <Link to="/booking">Appointment</Link>
          ) : (
            <button
              onClick={() => setBook({ ...book, showBookDiv: true })}
              disabled={book.showBookDiv}
            >
              {book.booked ? "Booked" : "Book Appointment"}
            </button>
          )}
          {showInbox && (
            <div>
              <input placeholder="Type" ref={messageRef} />
              <button
                onClick={() => {
                  socket.emit(
                    "msg from sender",
                    messageRef.current?.value,
                    `${vendorFromLoader.id}`
                  );
                }}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          )}
        </div>
        {book.showBookDiv && (
          <div>
            <input type="date" placeholder="Pick date" ref={bookRef} />
            <button
              onClick={() => {
                const fd = new FormData();
                fd.append("todo", "book");
                fd.append("due", JSON.stringify(bookRef.current?.valueAsDate));
                bookAppointment.submit(fd, { method: "POST" });
                setBook({ showBookDiv: false, booked: true });
              }}
            >
              Book
            </button>
          </div>
        )}
        <div className="p-2">
          <VendorHeadComponent
            data={vendorFromLoader}
            subscribed={subscribed}
            offerer={offerer}
          />
        </div>
        {vendorFromLoader.posts && (
          <div className="mt-8">
            <hr className="my-4 mr-3 bg-black" />
            <div className="m-4 flex flex-col gap-12">
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
                className="flex-grow resize-none rounded-sm border p-4 shadow-lg"
              ></textarea>
              <label htmlFor="media" className="cursor-pointer">
                <span className="material-symbols-outlined text-red-600">
                  video_library
                </span>
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
                <span className="material-symbols-outlined text-red-700">
                  Share
                </span>
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
