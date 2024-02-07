import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import EditableSelect from "~/components/EditableSelect";
import { Spinner } from "~/components/Spinner";
import { storeMedia } from "~/firebase/firebase";
import { createVendor } from "~/models/vendor.server";
import { getSession, getUserId } from "~/session.server";
import type { Context, Location, Media } from "~/types";

export const action = async ({ request }: ActionArgs) => {
  const session = await getSession(request);
  if (session.has("userId")) {
    const formdata = await request.formData();
    const userId = await getUserId(request);
    const name = formdata.get("name")! as string;
    const serviceName = formdata.get("serviceName")! as string;
    const about = formdata.get("about")! as string;
    let cover: Media[];
    try {
      cover = JSON.parse(formdata.get("cover") as string);
    } catch (e) {
      cover = [];
    }
    const website = formdata.get("website") as string;
    const email = formdata.get("email") as string;
    const phone = formdata.get("phone") as string;
    let coord: Location | undefined;
    try {
      coord = JSON.parse(formdata.get("coord") as string) as Location;
    } catch (e) {
      coord = undefined;
    }
    const address = formdata.get("address") as string;
    const contact = {
      website,
      email,
      phone,
      address,
    };
    const newVendorName = await createVendor(
      name,
      userId!,
      about,
      serviceName,
      contact,
      coord,
      cover
    );
    throw redirect(`/vendor/${newVendorName.id}`);
  }
  throw new Response("You are not logged in", { status: 401 });
};

export default function Index() {
  const { allServices } = useOutletContext<Context>();
  const [error, setError] = useState(false);
  const provideRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [cover, setCover] = useState<Array<Media>>();
  const [uploading, setUploading] = useState("");
  const [media, setMedia] = useState<FileList | null>();
  const [coord, setCoord] = useState<Location>();
  const navigation = useNavigation();
  const getSynonymsFetcher = useFetcher();
  const [serviceName, setServiceName] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function doCover() {
      if (uploading === "loading" && media) {
        setCover(await storeMedia(`${nameRef.current!.value}`, media!));
      }
    }
    doCover();
  }, [media, uploading]);

  useEffect(() => {
    if (cover && cover.length > 0) {
      setUploading(`Upload successful`);
      setError(false);
      provideRef.current!.disabled = false;
    }
  }, [cover]);

  useEffect(() => {
    if (
      serviceName.length > 0 &&
      done &&
      getSynonymsFetcher.state === "idle" &&
      !getSynonymsFetcher.data
    ) {
      provideRef.current!.disabled = true;
      getSynonymsFetcher.submit(
        { service: serviceName },
        { action: "/getsynonyms", method: "post" }
      );
    }
  }, [serviceName, getSynonymsFetcher, done]);

  useEffect(() => {
    if (getSynonymsFetcher.state === "idle" && getSynonymsFetcher.data) {
      setServiceName(getSynonymsFetcher.data.service);
    }
    if (provideRef.current) provideRef.current.disabled = false;
  }, [getSynonymsFetcher.data, getSynonymsFetcher.state]);

  return navigation.state === "submitting" ? (
    <div className="mx-auto w-max">
      <Spinner width="w-14" height="h-14" />
    </div>
  ) : (
    <Form
      method="POST"
      className="mx-auto mb-6 w-11/12 rounded-lg bg-slate-700 p-4 shadow-2xl shadow-slate-400"
    >
      <h1 className="mb-8 pt-4 text-center font-sans text-5xl uppercase tracking-widest text-white">
        Show Yourself
      </h1>
      <div className="mb-4">
        <label>
          <p className="mb-2 text-white">
            Name - Choose a name that reflects what you are offering
          </p>
          <input
            placeholder="Name of Provider - this is your profile name"
            ref={nameRef}
            name="name"
            required
            className="w-full rounded-md p-4"
          />
        </label>
      </div>
      <div className="mb-4">
        <label>
          <p className="mb-2 text-white">
            Tell what you do and how you stand out
          </p>
          <textarea
            name="about"
            className="w-full resize-none rounded-md border-2 p-2"
            placeholder="Description"
          ></textarea>
        </label>
      </div>
      <div className="relative mb-4">
        <EditableSelect
          placeholder="What type of Service do you offer"
          name="serviceName"
          value={serviceName}
          textChanged={setServiceName}
          blurred={() => {
            setDone(true);
          }}
          list={
            allServices.length > 0
              ? allServices.map((service) => service.name)
              : []
          }
          listClicked={setServiceName}
        />
      </div>
      <div className="mx-auto mb-4 mt-4 w-4/5 text-center">
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
            if (media && media.length > 2) {
              setError(true);
              return;
            }
            setUploading("loading");
            setMedia(media);
          }}
        />
        {error && (
          <p className="mt-2 flex justify-center text-center text-red-500">
            A maximum of 2 is allowed
          </p>
        )}
        {uploading === "loading" && (
          <div className="mx-auto w-max">
            <Spinner width="w-10" height="h-10" />
          </div>
        )}
        {uploading === "Upload successful" && (
          <div className="mt-2 flex justify-center text-center text-red-500">
            {uploading}
          </div>
        )}
      </div>
      <div className="mb-4">
        <hr className="mb-2 sm:w-0" />
        <div className="grid grid-cols-3 items-center gap-4">
          <hr className="w-0 sm:w-auto" />
          <p className=" flex w-full justify-center gap-2 text-white">
            <span>Contact</span> <span>Information</span>
          </p>
          <hr className="w-0 sm:w-auto" />
        </div>
        <div className="mb-2">
          <label className="w-full">
            <p className="mb-2 text-white">Town, City or A Landmark near you</p>
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
                setCoord({ lat, long });
              }}
              className="w-full rounded p-2"
              required
            />
          </label>
        </div>
        <div className="mb-2">
          <label>
            <p className="mb-2 text-white">
              Full address that will be displayed on your profile
            </p>
            <input name="address" className="w-full rounded p-2" />
          </label>
        </div>
        <div className="mb-2">
          <label>
            <p className="mb-2 text-white">Phone Number</p>
            <input
              type="number"
              name="phone"
              className="w-full rounded p-2"
              required
            />
          </label>
        </div>
        <div className="mb-2">
          <label>
            <p className="mb-2 text-white">E-mail</p>
            <input type="email" name="email" className="w-full rounded p-2" />
          </label>
        </div>
        <div className="mb-2">
          <label>
            <p className="mb-2 text-white">Website</p>
            <input
              name="website"
              placeholder="Website"
              className="w-full rounded p-2"
            />
          </label>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          ref={provideRef}
          type="submit"
          className="rounded-md border border-transparent bg-amber-600 p-2 text-2xl uppercase tracking-wider"
        >
          Provide
        </button>
      </div>
      <input type="hidden" name="cover" value={JSON.stringify(cover)} />
      <input type="hidden" name="coord" value={JSON.stringify(coord)} />
    </Form>
  );
}
