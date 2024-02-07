import type { ActionArgs } from "@remix-run/node";
import { Link, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { login } from "~/firebase/firebase";
import { findUser, createUser } from "~/models/user.server";
import { createUserSession } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const formdata = await request.formData();
  const remember = Boolean(formdata.get("remember"));
  const user = JSON.parse(formdata.get("user") as string) as {
    name: string | null;
    id: string;
  };
  const userInDatabase = await findUser(user.id!);
  if (!userInDatabase) await createUser({ id: user.id!, name: user.name! });
  return await createUserSession({
    request,
    redirectTo: "/",
    remember,
    userId: user.id!,
  });
};

export default function Index() {
  const [user, setUser] = useState<{
    name: string | null;
    id: string;
  }>();
  const [emailAndPassword, setEmailAndPassword] = useState({
    email: "",
    password: "",
  });
  const [displayName, setDisplayName] = useState("");
  const [remember, setRemember] = useState(false);
  const submit = useSubmit();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (user) {
      const fd = new FormData();
      fd.append("remember", String(remember));
      fd.append("user", JSON.stringify(user));
      submit(fd, { method: "post" });
    }
  }, [user, remember, submit]);

  return (
    <div className="mx-auto mt-2 flex w-11/12 flex-col justify-center md:mt-6 md:w-3/5">
      <h1 className="mb-4 text-center text-4xl capitalize text-emerald-800">
        Sign up to enjoy a personalized service
      </h1>
      <div className="my-4 bg-slate-800 p-6">
        <p className="mb-8 mt-4 text-center text-2xl text-slate-400">
          Sign up using your e-mail and password
        </p>
        {error && (
          <p className="mx-auto mb-2 w-max text-red-600">Couldn't sign up</p>
        )}
        <div className="flex flex-col gap-4">
          <input
            className="mx-auto w-3/4 rounded p-2"
            value={displayName}
            placeholder="Your Display Name"
            onChange={(e) => {
              setDisplayName(e.target.value);
            }}
          />
          <input
            type="email"
            className="mx-auto w-3/4 rounded p-2"
            placeholder="E-mail"
            onChange={(e) => {
              setEmailAndPassword({
                ...emailAndPassword,
                email: e.target.value,
              });
            }}
          />
          <input
            type="password"
            className="mx-auto w-3/4 rounded p-2"
            placeholder="Password"
            onChange={(e) => {
              setEmailAndPassword({
                ...emailAndPassword,
                password: e.target.value,
              });
            }}
          />
          <div className="flex items-center justify-evenly">
            <button
              className="rounded-lg bg-yellow-600 px-5 py-2 text-yellow-50"
              onClick={async () => {
                const access = await login(
                  "create",
                  emailAndPassword.email,
                  emailAndPassword.password
                );
                if (access) setUser({ name: displayName, id: access.id });
                else setError(true);
              }}
            >
              Sign up
            </button>
            <Link to="/login" className="text-slate-100">
              Login instead
            </Link>
          </div>
          <div className="mb-4 flex justify-center">
            <label className="text-white">
              <input
                type="checkbox"
                onChange={(e) => {
                  setRemember(e.target.checked);
                }}
              />{" "}
              Remember Me
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
