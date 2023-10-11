import type { LoaderArgs } from "@remix-run/node";
import { logout } from "~/session.server";

export const loader = async ({request}: LoaderArgs) => logout(request);
