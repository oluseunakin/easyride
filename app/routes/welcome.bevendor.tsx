import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Await, Form, useNavigation, useOutletContext } from "@remix-run/react";
import { Suspense, useEffect, useRef, useState } from "react";
import EditableSelect from "~/components/EditableSelect";
import { Spinner } from "~/components/Spinner";
import { storeMedia } from "~/firebase/firebase";
import { createVendor } from "~/models/vendor.server";
import { getSession, getUserId } from "~/session.server";
import type { Contact, context, Media } from "~/types";

export const action = async ({ request }: ActionArgs) => {
  const session = await getSession(request);
  if (session.has("userId")) {
    const formdata = await request.formData();
    const userId = await getUserId(request);
    const name = formdata.get("name")! as string;
    const serviceName = formdata.get("serviceName")! as string;
    const about = formdata.get("about")! as string;
    const cover: Media[] = JSON.parse(formdata.get("cover") as string) ?? [];
    const website = formdata.get("website") as string;
    const email = formdata.get("email") as string;
    const phone = formdata.get("phone") as string;
    const coord = JSON.parse(formdata.get("coord") as string) as number[];
    const address = formdata.get("address") as string;
    const contact: Contact = {
      website,
      email,
      phone,
      address,
    };
    const newVendorName = await createVendor(
      name,
      userId,
      about,
      serviceName,
      contact,
      coord,
      cover
    );
    return redirect(`/welcome/vendor/${newVendorName}`);
  }
  throw new Response("You are not logged in", { status: 401 });
};

export default function Index() {
  const { allServices } = useOutletContext<context>();
  const [error, setError] = useState(false);
  const provideRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [cover, setCover] = useState<Array<Media>>();
  const [uploading, setUploading] = useState("");
  const [coord, setCoord] = useState<number[]>();
  const navigation = useNavigation();

  useEffect(() => {
    if (cover && cover.length > 0) {
      setUploading(`Upload successful`);
      setError(false);
      provideRef.current!.disabled = false;
    }
  }, [cover]);

  useEffect(() => {
    if (coord && typeof coord[0] === "string")
      setCoord((coord) => coord!.map((c) => Number(c)));
  }, [coord]);

  return navigation.state === "submitting" ? (
    <Spinner width="w-20" height="h-20" />
  ) : (
    <Form
      method="POST"
      className="mx-auto mb-6 w-11/12 rounded-lg bg-slate-800 p-4 shadow-2xl shadow-slate-400 md:w-4/5"
    >
      <h1 className="mb-6 pt-4 text-center font-sans text-5xl uppercase tracking-widest text-white">
        Show Yourself
      </h1>
      <div className="mb-7">
        <input
          placeholder="Name - Choose a name that reflects what you are offering"
          ref={nameRef}
          name="name"
          required
          className="w-full rounded-md p-4"
        />
      </div>
      <textarea
        name="about"
        className="mb-7 w-full resize-none rounded-md border-2 p-2"
        placeholder="Describe what you do and offer, feel free to be proud"
      ></textarea>
      <div className="relative mb-7">
        <Suspense
          fallback={
            <p>
              <EditableSelect list={[]} placeholder="Fetching Services" />
            </p>
          }
        >
          <Await
            resolve={allServices}
            errorElement={<p>Nothing was fetched from server</p>}
          >
            {(allServices) => (
              <EditableSelect
                placeholder="What type of Service do you offer"
                name="serviceName"
                list={allServices.map((service) => service.name)}
              />
            )}
          </Await>
        </Suspense>
      </div>
      <div className="mb-7 mt-4 w-4/5 mx-auto text-center">
        <label
          htmlFor="cover"
          className="cursor-pointer text-center text-xl text-amber-500"
        >
          Add a cover picture and/or video that shows or describe what you do
        </label>
        <input
          id="cover"
          className="hidden"
          type="file"
          multiple
          onChange={async (e) => {
            const media = e.target.files;
            setError(false);
            provideRef.current!.disabled = true;
            if (media && media.length > 2 && provideRef.current) {
              setError(true);
              return;
            }
            setUploading("loading");
            setCover(await storeMedia(`${nameRef.current!.value}`, media!));
          }}
        />
        {error && (
          <p className="mt-2 flex justify-center text-center text-red-500">
            A maximum of 2 is allowed
          </p>
        )}
        {uploading === "loading" && (
          <div className="mt-2 flex justify-center">
            <div className="mr-3 ">
              <Spinner width="w-7" height="h-7" />
            </div>
          </div>
        )}
        {uploading === "Upload successful" && (
          <div className="mt-2 flex justify-center text-center text-red-500">
            {uploading}
          </div>
        )}
      </div>
      <div className="mb-7 flex flex-col gap-4">
        <hr className="mb-2 sm:w-0" />
        <div className="grid grid-cols-3 items-center gap-4">
          <hr className="w-0 sm:w-auto" />
          <p className=" flex w-full justify-center gap-2 text-white">
            <span>Contact</span> <span>Information</span>
          </p>
          <hr className="w-0 sm:w-auto" />
        </div>
        <input
          onBlur={async (e) => {
            const val = e.target.value;
            const coords = await fetch(
              "https://nominatim.openstreetmap.org/search?addressdetails=1&format=jsonv2&q=" +
                val
            );
            const coordsJson = (await coords.json())[0];
            const lat = Number(coordsJson.lat);
            const long = Number(coordsJson.lon);
            setCoord([lat, long]);
          }}
          placeholder="Town, City or A Landmark near you"
          className="rounded p-2"
          required
        />
        <input
          placeholder="Full Address that will be shown to your clients"
          name="address"
          className="rounded p-2"
        />
        <input
          type="number"
          name="phone"
          placeholder="Phone Number"
          className="rounded p-2"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          className="rounded p-2"
        />
        <input name="website" placeholder="Website" className="rounded p-2" />
      </div>
      <div className="flex justify-center">
        <input
          ref={provideRef}
          value="Provide"
          type="submit"
          className="cursor-pointer rounded-md border border-transparent bg-amber-600 p-2 text-2xl uppercase tracking-wider"
        />
      </div>
      <input type="hidden" name="cover" value={JSON.stringify(cover)} />
      <input type="hidden" name="coord" value={JSON.stringify(coord)} />
    </Form>
  );
}
