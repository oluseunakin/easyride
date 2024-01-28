import { useEffect, useRef, useState } from "react";
import { dateFormatter } from "~/helper";
import { socket } from "~/root";
import type { Message } from "~/types";

export const Inbox = (props: {
  title: string;
  providerId: number;
  userId: string;
  chats: Message[];
  offerer: boolean;
}) => {
  const { providerId, userId, chats, offerer, title } = props;
  const messageRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLParagraphElement>(null);
  const [count, setCount] = useState(0);
  const [chatState, setChatState] = useState(chats);
  const sender = String(offerer ? providerId : userId);
  const receiver = String(offerer ? userId : providerId);
  useEffect(() => {
    const div = document.querySelector(".div");
    div!.scrollTop = div!.scrollHeight;
    chatState &&
      chatState.forEach((c, i) => {
        const sender = c.sender;
        const div = document.querySelectorAll(".divref").item(i);
        if (i === 0) div.classList.add("mt-2");
        if (offerer) {
          if (sender === String(providerId))
            div.classList.add("mr-20", "bg-amber-400", "md:mr-40", "text-black");
          else div.classList.add("ml-20", "bg-emerald-700", "md:ml-40", "text-white");
        } else {
          if (sender === userId)
            div.classList.add("mr-20", "bg-amber-400", "md:mr-40", "text-black");
          else div.classList.add("ml-20", "bg-emerald-700", "md:ml-40", "text-white");
        }
      });
  }, [chatState, offerer, providerId, userId]);

  useEffect(() => {
    socket.on(
      "msg to receiver",
      (count: number, receivver: string, text: string, sender) => {
        setChatState((chats) => [
          ...chats!,
          { sender, text, time: new Date().toString() },
        ]);
      }
    );
    return () => {
      socket.off("msg to receiver");
    };
  }, []);

  useEffect(() => {
    if (count != 0) {
      socket.emit(
        "msg from sender",
        count,
        receiver,
        messageRef.current?.value,
        sender
      );
      messageRef.current!.value = "";
      const div = document.querySelector(".div");
      div!.scrollTop = div!.scrollHeight;
    }
  }, [receiver, count, sender, offerer, chats, title, providerId, userId]);

  const send = () => {
    const text = messageRef.current!.value;
    setChatState((chats) => [
      ...chats!,
      {
        text,
        time: new Date().toString(),
        sender,
      },
    ]);
    const fd = new FormData();
    fd.append("text", text);
    fd.append("sender", sender);
    fetch(`/chats/${userId}/${providerId}`, {
      method: "post",
      body: JSON.stringify({ text, sender }),
      headers: { "Content-Type": "application/json" },
    });
    setCount(count + 1);
    const div = document.querySelector(".div");
    div!.scrollTop = div!.scrollHeight;
  };

  return (
    <div className="h-9/10">
      <p className="m-3 bg-slate-700 text-center text-3xl text-lime-300">
        {title}
      </p>
      <div className="div mb-4 h-4/5 overflow-auto rounded bg-green-100">
        {chatState.length == 0 ? (
          <p className="text-center text-3xl">Nothing here yet</p>
        ) : (
          chatState.map((c, i) => {
            const daate = new Date(c.time);
            return (
              <div
                key={i}
                className="divref mx-2 mb-2 flex gap-2 rounded-lg p-2"
              >
                <p
                  onClick={() => {
                    timeRef.current?.classList.replace("hidden", "flex");
                  }}
                  className="pl-2 text-sm"
                >
                  {c.text}
                </p>
                <p className="hidden gap-2 text-xs" ref={timeRef}>
                  <span>{daate.getDate()}</span>
                  <span>{dateFormatter(daate.getMonth())}</span>
                  <span>{daate.getFullYear()}</span>
                </p>
              </div>
            );
          })
        )}
      </div>
      <div className="mx-1 flex gap-2">
        <input
          placeholder="Type"
          ref={messageRef}
          className="flex-grow rounded-md p-2"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              send();
            }
          }}
        />
        <button
          onClick={() => {
            send();
          }}
        >
          <span className="material-symbols-outlined text-red-400">send</span>
        </button>
      </div>
    </div>
  );
};
