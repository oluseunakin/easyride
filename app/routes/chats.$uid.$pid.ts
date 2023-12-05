import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import { hashParties } from "~/helper";

export const loader = async ({ params }: LoaderArgs) => {
  const { uid, pid } = params;
  let hashedId = hashParties(uid!);
  if (pid) hashedId += Number(pid);
  const chat = await prisma.chat.findUnique({ where: { id: hashedId } });
  if(!chat) return {id: -1, messages: []}
  return chat
};

export const action = async ({ params, request }: ActionArgs) => {
  const { uid, pid } = params
  const dataFromClient = await request.json();
  const data = {
    ...dataFromClient,
    time: new Date().toString(),
  };
  let hashedId = hashParties(uid!);
  if (pid) hashedId += Number(pid); 
  const oldChat = await prisma.chat.findUnique({
    where: { id: hashedId },
  });
  if (!oldChat)
    await prisma.chat.create({
      data: {
        id: hashedId,
        messages: [data],
      },
    });
  else {
    const messages = [...oldChat.messages, data];
    await prisma.chat.update({ where: { id: hashedId }, data: { messages } });
  }
  return null;
};
