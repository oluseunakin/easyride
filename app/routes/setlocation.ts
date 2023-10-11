import { json, type ActionArgs } from "@remix-run/node";
import { getSession, sessionStorage } from "~/session.server";
import type { Location } from "~/types";

export const action = async ({ request }: ActionArgs) => {
  const fd = await request.formData();
  const coord = JSON.parse(fd.get("coord") as string) as Location;
  const session = await getSession(request);
  session.set("location", coord);
  return json(null, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
};
