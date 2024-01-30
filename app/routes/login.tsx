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
    id: string
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
  const [remember, setRemember] = useState(false);
  const submit = useSubmit();

  useEffect(() => {
    if (user) {
      const fd = new FormData();
      fd.append("remember", String(remember));
      fd.append("user", JSON.stringify(user));
      submit(fd, { method: "post"});
    }
  }, [user, remember, submit]);

  return (
    <div className="flex h-screen w-11/12 mx-auto flex-col gap-16 mt-6">
      <h1 className="text-4xl capitalize text-center">
        Login to enjoy a personalized service
      </h1>
      <div className=" bg-slate-800 p-6 text-white mx-auto w-5/6 md:w-3/5">
        <div className="m-8 flex justify-center mt-4">
          <button
            className="rounded-full border border-transparent bg-green-600 p-8 text-2xl text-green-50"
            onClick={async () => {
              const access = await login("google");
              if (access) setUser(access);
            }}
          >
            Login with Google
          </button>
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
        <div className="flex justify-center mb-4">
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
