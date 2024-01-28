import { useEffect, useState } from "react";

export type Media = {
  url: string;
  ct: string;
};

export const MediaComponent = (props: { sources: Media[] }) => {
  const { sources } = props;
  const [media, setMedia] = useState(sources);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let nm: Media[] = [];
      media.forEach((pm, i, arr) => {
        if (i === 0 && pm.ct === "video") {
          // If the first element is a video, keep it at index 0
          nm[i] = pm;
        } else {
          // Move all other elements to the left
          nm[i - 1 < 0 ? arr.length - 1 : i - 1] = pm;
        }
      });
      setMedia(nm);
    }, 7000);
    return () => {
      clearTimeout(timeout);
    };
  }, [media]);

  return (
    <>
      {media.map((m, i) => (
        <div key={i}>
          {m.ct.startsWith("image") ? (
            <img src={m.url} alt="App " />
          ) : (
            <video src={m.url} controls></video>
          )}
        </div>
      ))}
    </>
  );
};
