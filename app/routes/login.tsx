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
  const [remember, setRemember] = useState(false);
  const submit = useSubmit();
  
  const [error, setError] = useState("");

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
        Login to enjoy a personalized service
      </h1>
      <div className="my-4 bg-slate-800 p-6">
        <div className="flex justify-center border-b py-4">
          <button
            className="rounded-2xl border border-transparent bg-green-600 p-4 text-2xl text-green-50"
            onClick={async () => {
              const access = await login("google");
              if (access) setUser(access);
              else setError("Couldn't sign in");
            }}
          >
            Login with Google
          </button>
        </div>
        <>
          <p className="mb-8 mt-4 text-center text-2xl text-slate-400 ">
            Sign in using your e-mail and password
          </p>
          {error.length > 0 && (
            <p className="mx-auto mb-2 w-max text-red-600">{error}</p>
          )}
          <div className="flex flex-col gap-4">
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
                    "signin",
                    emailAndPassword.email,
                    emailAndPassword.password
                  );
                  if (access) setUser(access);
                  else setError("Couldn't sign in");
                }}
              >
                Sign in
              </button>
              <Link to="/signup" className="text-slate-100">
                Sign up instead
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
        </>
      </div>
    </div>
  );
}
