import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { Location } from "./types";
invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const ss = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return ss.getSession(cookie);
}

export const getUserId = async (request: Request) => {
  const session = await getSession(request);
  if (session.has("userId")) {
    return session.get("userId") as string;
  }
  return null
}

export const getLocation = async (request: Request) => {
  const session = await getSession(request);
  if (session.has("location")) {
    return session.get("location") as Location;
  }
  return undefined
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await ss.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await ss.destroySession(session),
    },
  });
}