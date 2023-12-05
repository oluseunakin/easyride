import type { GetResult } from "@prisma/client/runtime";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { VendorHeadComponent } from "~/components/Vendor";
import { storeMedia } from "~/firebase/firebase";
import { createPost } from "~/models/post.server";
import { getFullVendor, subscribe, unsubscribe } from "~/models/vendor.server";
import { getUserId } from "~/session.server";
import type { FullVendor, Media, ModalState, context } from "~/types";
import { socket } from "./welcome";
import { Inbox } from "~/components/Inbox";
import { Modal } from "~/components/Modal";
import { PostComponent } from "~/components/Post";
import { Spinner } from "~/components/Spinner";

export const loader = async ({ params }: LoaderArgs) => {
  const id = Number(params.id);
  try {
    const vendor = await getFullVendor(id);
    return json(vendor);
  } catch (e) {
    console.log(e);
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
    const newPost = await createPost({ media, description, vendorId });
    return redirect(`post/${newPost.id}`);
  } else if (todo === "Request") {
    await subscribe(vendorId, userId);
  } else await unsubscribe(vendorId, userId);
  return null;
};

export default function Vendor() {
  const vendorFromLoader = useLoaderData<FullVendor | string>();
  const { user } = useOutletContext<context>();
  const [media, setMedia] = useState<Media[]>([]);
  const [postName, setPostName] = useState("");
  const createPostNavigator = useNavigation();
  const [uploading, setUploading] = useState("");
  const shareRef = useRef<HTMLButtonElement>(null);
  const bookAppointment = useFetcher();
  const [book, setBook] = useState({
    purpose: "",
    dueDate: -1,
    dueHour: -1,
    dueMinute: -1,
    bookerName: user!.name,
    bookerId: user!.id,
    done: false,
  });
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const fetchChats = useFetcher();
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

  useEffect(() => {
    if (media && media.length > 0) {
      setUploading(`Upload successful`);
      shareRef.current!.disabled = false;
    }
  }, [media]);

  useEffect(() => {
    if (typeof vendorFromLoader !== "string") {
      const offerer = Boolean(
        user!.offering.find((offer) => offer.name === vendorFromLoader.name)
      );
      offerer && socket.emit("join", `${vendorFromLoader.id}`);
    }
  }, [vendorFromLoader, user]);

  useEffect(() => {
    if (typeof vendorFromLoader !== "string") {
      const offerer = Boolean(
        user!.offering.find((offer) => offer.name === vendorFromLoader.name)
      );
      socket.on("msg to receiver", () => {
        modalState.index == -1 && offerer && setHasNewMessage(true);
      });
    }
  }, [modalState.index, user, vendorFromLoader]);

  useEffect(() => {
    if (
      typeof vendorFromLoader !== "string" &&
      fetchChats.data &&
      fetchChats.state === "idle"
    ) {
      const offerer = Boolean(
        user!.offering.find((offer) => offer.name === vendorFromLoader.name)
      );
      setModalState({
        data: (
          <Inbox
            offerer={offerer}
            chats={fetchChats.data.messages}
            title={
              receiver.id === "joker" ? vendorFromLoader.name : receiver.name
            }
            providerId={vendorFromLoader.id}
            userId={receiver.id === "joker" ? user!.id : receiver.id}
          />
        ),
      });
    }
  }, [receiver.id, receiver.name]);

  useEffect(() => {
    book.done &&
      bookAppointment.submit(book, {
        method: "post",
        encType: "application/json",
        action: "booking",
      });
  }, [book]);

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
    const booked = Boolean(
      vendorFromLoader.bookings.find((value) => value.bookerName === user?.id)
    );

    return (
      <div className="mb-2">
        <Outlet context={{ user }} />
        <div className="mb-2 mr-2 flex items-baseline justify-end gap-4">
          <button
            onClick={() => {
              if (!offerer) {
                setReceiver({ ...receiver, name: vendorFromLoader.name });
                fetchChats.load(`/chats/${user?.id}/${vendorFromLoader.id}`);
              } else {
                setModalState({
                  data: (
                    <div className=" h-8.5/10 overflow-auto bg-slate-200 text-center text-gray-700">
                      {vendorFromLoader.subscribers.length > 0 ? (
                        vendorFromLoader.subscribers.map((s, i) => (
                          <div key={i} className="m-4 text-lg text-red-700">
                            <button
                              onClick={() => {
                                setReceiver({ ...s });
                                fetchChats.load(
                                  `/chats/${s.id}/${vendorFromLoader.id}`
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
                            action="/welcome/boost"
                            method="post"
                            className="ml-2 text-red-500 underline"
                          >
                            <input
                              type="hidden"
                              name="vendorid"
                              value={vendorFromLoader.id}
                            />
                            <input
                              type="submit"
                              value="Boost your visibility"
                            />
                          </Form>
                        </p>
                      )}
                    </div>
                  ),
                });
              }
            }}
          >
            <span className="material-symbols-outlined text-amber-700">
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
                      <div className="flex-grow">
                        <input
                          className="m-10 mx-auto w-full rounded-lg p-2"
                          placeholder="Purpose for Appointment"
                          name="purpose"
                          onChange={(e) => {
                            setBook((book) => ({
                              ...book,
                              purpose: e.target.value,
                            }));
                          }}
                        />
                        <input
                          className="m-10 mx-auto mb-4 w-full rounded-lg p-2"
                          type="datetime-local"
                          placeholder="Pick date"
                          name="due"
                          onChange={(e) => {
                            const datetime = new Date(e.target.value);
                            setBook((book) => ({
                              ...book,
                              dueDate: datetime.getDate(),
                              dueHour: datetime.getHours(),
                              dueMinute: datetime.getMinutes(),
                            }));
                          }}
                        />
                        <button
                          onClick={(e) => {
                            setBook((book) => ({ ...book, done: true }));
                            setModalState({ type: "close" });
                          }}
                          className="m-4 mx-auto block rounded-md bg-red-600 p-2 text-xl text-white"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ),
                });
              }}
            >
              {booked ? (
                <span className="material-symbols-outlined booked text-red-900">
                  bookmark
                </span>
              ) : (
                <span className="material-symbols-outlined text-red-900">
                  bookmark
                </span>
              )}
            </button>
          )}
        </div>
        {modalState.children.length > 0 && (
          <Modal setModalState={setModalState} modalState={modalState} />
        )}
        <div className="p-2">
          <VendorHeadComponent
            data={vendorFromLoader}
            subscribed={subscribed}
            offerer={offerer}
          />
        </div>
        {offerer &&
          (createPostNavigator.state === "submitting" ? (
            <div className="flex justify-center">
              <Spinner width="w-10" height="h-10" />
            </div>
          ) : (
            <Form
              method="post"
              className="sticky top-0 mx-auto mt-8 bg-slate-700 p-4 md:w-3/4 lg:w-2/3"
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
          ))}
        {vendorFromLoader.posts && (
          <div className="mt-8">
            <div className="m-4 flex flex-col gap-8">
              {vendorFromLoader.posts.map((p, i) => (
                <div key={i} className="md:w-5/6 lg:w-4/5 md:mx-auto">
                  <PostComponent
                    post={p}
                    userId={user!.id}
                    username={user!.name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
