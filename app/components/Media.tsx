import { useEffect, useRef, useState } from "react";
import type { Media } from "~/types";

export const MediaComponent = (props: { sources: Media[] }) => {
  const { sources } = props;
  const [media, setMedia] = useState<Media[]>(sources);
  const dRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const documentWidth = window.innerWidth;
    const isBigDevice = documentWidth >= 768;
    if (media.length == 1) {
      divRef.current?.classList.remove("flex");  
    }
    if (isBigDevice) {
      divRef.current?.classList.add("justify-center")
      return;
    }
    const newMedia: Media[] = [];
    let j = 0;
    let delay = 7000;
    media.forEach((m, i) => {
      if (m.ct.includes("video")) {
        const videoElement = dRef.current!.firstElementChild!
          .firstElementChild as HTMLMediaElement;
        delay = videoElement.duration;
      }
      if (i == media.length - 1) j = 0;
      else j++;
      newMedia[j] = m;
    });
    setTimeout(() => {
      setMedia(newMedia);
    }, delay);
  });

  return (
    <div className="flex gap-4 overflow-hidden md:overflow-auto" ref={divRef}>
      {media.map((m, i) => (
        <div key={i} className="min-w-full md:min-w-0 flex justify-center" ref={dRef}>
          {m.ct.startsWith("image") ? (
            <img src={m.url} alt="App" />
          ) : (
            <video src={m.url} controls></video>
          )}
        </div>
      ))}
    </div>
  );
};
