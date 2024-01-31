import type { ActionArgs } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
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
  const [signUp, setSignUp] = useState(false);

  useEffect(() => {
    if (user) {
      const fd = new FormData();
      fd.append("remember", String(remember));
      fd.append("user", JSON.stringify(user));
      submit(fd, { method: "post" });
    }
  }, [user, remember, submit]);

  return (
    <div className="mx-auto mt-8 flex w-11/12 flex-col justify-center md:w-3/4">
      <h1 className="mb-8 text-center text-4xl capitalize">
        Login to enjoy a personalized service
      </h1>
      <div className=" mx-auto w-5/6 bg-slate-800 p-6 text-white md:w-3/5">
        <div className="m-4 flex justify-center py-4 border-b">
          <button
            className="rounded-2xl border border-transparent bg-green-600 px-8 py-4 text-2xl text-green-50"
            onClick={async () => {
              const access = await login("google");
              if (access) setUser(access);
            }}
          >
            Login with Google
          </button>
        </div>
        <div className="my-4">
          <p className="my-4 text-center">
            {signUp ? "Sign up" : "Sign in"} using your e-mail and password
          </p>
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
            <div className="flex justify-around w-2/3 mx-auto">
              <button
                className="rounded-lg bg-yellow-600 px-5 py-2 text-yellow-50"
                onClick={async () => {
                  const ep = signUp ? "signup" : "signin";
                  const access = await login(
                    ep,
                    emailAndPassword.email,
                    emailAndPassword.password
                  );
                  if (access) setUser(access);
                }}
              >
                {signUp ? "Sign up" : "Sign in"}
              </button>
              <button
                onClick={() => {
                  setSignUp(!signUp);
                }}
              >
                {signUp ? "Sign in instead" : "Sign up instead"}
              </button>
            </div>
          </div>
        </div>

        {/* <div className="flex justify-center m-8">
          <button
            className="rounded-full border border-transparent bg-orange-600 p-8"
            onClick={async () => {
              const access = await login("facebook");
              if (access) setUser(access);
            }}
          >
            Login with Facebook
          </button>
        </div> */}
        <div className="mb-4 flex justify-center">
          <label>
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
  );
}
