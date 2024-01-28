import { defer } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import {
  Await,
  Form,
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Suspense, useEffect, useReducer, useRef, useState } from "react";
import { VendorComponent } from "~/components/Vendor";
import { storeMedia } from "~/firebase/firebase";
import { createPost } from "~/models/post.server";
import { getFullVendor, subscribe, unsubscribe } from "~/models/vendor.server";
import { getUserId } from "~/session.server";
import type { Media, ModalState } from "~/types";
import { Inbox } from "~/components/Inbox";
import { Modal } from "~/components/Modal";
import { PostComponent } from "~/components/Post";
import { Spinner } from "~/components/Spinner";
import { findUserWithOfferings } from "~/models/user.server";
import { socket } from "~/root";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const id = Number(params.id);
  const vendor = getFullVendor(id);
  const user = await findUserWithOfferings(userId);
  const offerer = Boolean(user?.offering.find((o) => o.id == id));
  return defer({ vendor, offerer, userId, name: user?.name });
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await getUserId(request);
  const fd = await request.formData();
  const todo = fd.get("todo") as string;
  const vendorId = Number(params.id);
  if (todo === "post") {
    const description = fd.get("post") as string;
    let media: Media[];
    try {
      media = JSON.parse(fd.get("media") as string);
    } catch (e) {
      media = [];
    }
    await createPost({ media, description, vendorId });
    return null;
  } else if (todo === "Request") {
    await subscribe(vendorId, userId);
  } else await unsubscribe(vendorId, userId);
  return null;
};

export default function Vendor() {
  const { vendor, userId, offerer, name } = useLoaderData<typeof loader>();
  const vendorRef = useRef<Awaited<typeof vendor>>();
  const [media, setMedia] = useState<FileList | null>();
  const [mediaLinks, setMediaLinks] = useState<Media[]>();
  const [postName, setPostName] = useState("");
  const createPostNavigation = useNavigation();
  const [uploading, setUploading] = useState("");
  const shareRef = useRef<HTMLButtonElement>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const fetchChats = useFetcher();
  const hasBookedRef = useRef<HTMLSpanElement>(null);
  const [modalState, setModalState] = useReducer(
    (state: ModalState, action: any): ModalState => {
      if (action.type === "close") return { index: -1, children: [] };
      else if (action.type === "back") {
        const children = [...state.children];
        children.pop();
        return { index: state.index - 1, children };
      } else
        return {
          index: state.index + 1,
          children: [...state.children, action.data],
        };
    },
    { index: -1, children: [] }
  );
  const [receiver, setReceiver] = useState({ name: "", id: "joker" });
  const bookerFetcher = useFetcher();

  useEffect(() => {
    async function doCover() {
      if (uploading === "loading" && media && vendorRef.current) {
        setMediaLinks(
          await storeMedia(
            `${vendorRef.current.id}${Math.floor(Math.random() * 100)}`,
            media!
          )
        );
        setUploading(`Upload successful`);
        shareRef.current!.disabled = false;
      }
    }
    doCover();
  }, [media, uploading]);

  useEffect(() => {
    socket.on("msg to receiver", () => {
      modalState.index == -1 && offerer && setHasNewMessage(true);
    });
  }, [modalState.index, offerer]);

  useEffect(() => {
    if (fetchChats.data && fetchChats.state === "idle") {
      setModalState({
        data: (
          <Inbox
            offerer={offerer}
            chats={fetchChats.data.messages}
            title={
              receiver.id === "joker" ? vendorRef.current!.name : receiver.name
            }
            providerId={vendorRef.current!.id}
            userId={receiver.id === "joker" ? userId : receiver.id}
          />
        ),
      });
    }
  }, [
    receiver.id,
    receiver.name,
    offerer,
    fetchChats.data,
    fetchChats.state,
    userId,
  ]);

  useEffect(() => {
    if (bookerFetcher.state === "idle" && bookerFetcher.data) {
      setModalState({ type: "close" });
      hasBookedRef.current?.classList.add("booked");
    }
  }, [bookerFetcher.data, bookerFetcher.state]);

  return (
    <div className="mb-2">
      <Outlet />
      <div className="my-2 mr-2 flex items-baseline justify-end gap-4">
        <button
          onClick={() => {
            if (!offerer) {
              setReceiver({ ...receiver, name: vendorRef.current!.name });
              fetchChats.load(`/chats/${userId}/${vendorRef.current!.id}`);
            } else {
              setModalState({
                data: (
                  <div className=" h-8.5/10 overflow-auto bg-slate-200 text-center text-gray-700">
                    {vendorRef.current!.subscribers.length > 0 ? (
                      vendorRef.current!.subscribers.map((s, i) => (
                        <div key={i} className="m-4 text-lg text-red-500">
                          <button
                            onClick={() => {
                              setReceiver({ ...s });
                              fetchChats.load(
                                `/chats/${s.id}/${vendorRef.current!.id}`
                              );
                            }}
                          >
                            {s.name}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="flex h-full items-center justify-center">
                        Nobody has subscribed to what you offer,{" "}
                        <Form
                          action="boost"
                          method="post"
                          className="ml-2 text-red-500 underline"
                        >
                          <input
                            type="hidden"
                            name="vendorid"
                            value={vendorRef.current!.id}
                          />
                          <input type="submit" value="Boost your visibility" />
                        </Form>
                      </p>
                    )}
                  </div>
                ),
              });
            }
          }}
        >
          <span className="material-symbols-outlined text-amber-900">
            inbox
          </span>
          {offerer && hasNewMessage && (
            <span className="small-star material-symbols-outlined -ml-2 align-super text-red-500">
              star
            </span>
          )}
        </button>
        {offerer ? (
          <Link to="booking?count=0">
            <span className="material-symbols-outlined text-red-900">
              library_books
            </span>
          </Link>
        ) : (
          <button
            onClick={() => {
              setModalState({
                data: (
                  <div className="mx-auto flex h-5/6 w-3/4 items-center">
                    <bookerFetcher.Form
                      className="flex-grow"
                      method="post"
                      action="booking"
                    >
                      <h1 className="text-center text-lg text-white">
                        Book an Appointment with us to serve you better
                      </h1>
                      <input
                        className="m-6 mx-auto w-full rounded-lg p-2"
                        placeholder="Purpose for Appointment"
                        name="purpose"
                      />
                      <input
                        className="m-6 mx-auto mb-4 w-full rounded-lg p-2"
                        type="date"
                        placeholder="Pick date"
                        name="dueDate"
                      />
                      <input type="hidden" name="booker" value={userId} />
                      <button
                        type="submit"
                        className="m-4 mx-auto block rounded-md bg-red-600 p-2 text-xl text-white"
                      >
                        Book
                      </button>
                    </bookerFetcher.Form>
                  </div>
                ),
              });
            }}
          >
            <span
              className="material-symbols-outlined text-red-900"
              ref={hasBookedRef}
            >
              bookmark
            </span>
          </button>
        )}
      </div>
      {modalState.index != -1 && (
        <Modal setModalState={setModalState} modalState={modalState} />
      )}
      <Suspense
        fallback={
          <div>
            <Spinner width="w-10" height="h-10" />
          </div>
        }
      >
        <Await resolve={vendor!}>
          {(v) => {
            vendorRef!.current = v;
            v && offerer && socket.emit("join", `${v.id}`);
            const booked = Boolean(
              v
                ? v.bookings.find((value) => value.bookerName === userId)
                : false
            );
            if (booked) hasBookedRef.current?.classList.add("booked");
            return <VendorComponent vendor={v} userId={userId} />;
          }}
        </Await>
      </Suspense>
      {offerer &&
        (createPostNavigation.state === "submitting" ? (
          <div className="mx-auto w-max">
            <Spinner width="w-10" height="h-10" />
          </div>
        ) : (
          <Form
            method="post"
            className="sticky top-0 mx-auto my-4 w-11/12 rounded bg-slate-800 p-4 shadow-lg shadow-slate-300 md:w-3/4 lg:w-2/3"
          >
            <div className="ml-3 flex items-center gap-2">
              <textarea
                placeholder="Show workings..."
                name="post"
                value={postName}
                onChange={(e) => {
                  setPostName(e.target.value);
                }}
                className="flex-grow resize-none rounded-lg border p-4 shadow-lg"
              ></textarea>
              <label htmlFor="media" className="cursor-pointer">
                <span className="material-symbols-outlined text-red-700">
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
                  setMedia(media);
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
            <input
              type="hidden"
              name="media"
              value={JSON.stringify(mediaLinks)}
            />
          </Form>
        ))}
      <Suspense fallback={<div>Error fetching posts</div>}>
        <Await resolve={vendor}>
          {(vendor) =>
            vendor && vendor.posts.length > 0 ? (
              <div className="flex flex-col gap-2 m-2">
                {vendor.posts.map((p, i) => (
                  <div key={i} className="md:mx-auto md:w-5/6 lg:w-4/5">
                    <PostComponent
                      post={p}
                      userId={userId}
                      username={name}
                      setModalState={setModalState}
                      offerer={offerer}
                      vendorId={vendor.id}
                    />
                  </div>
                ))}
              </div>
            ) : null
          }
        </Await>
      </Suspense>
    </div>
  );
}
