import { useRef, useState } from "react";

const EditableSelect = (props: {
  list: any[];
  listClicked?: Function;
  placeholder: string;
  textChanged?: Function;
  name?: string;
  value?: string;
}) => {
  const { list, listClicked, placeholder, textChanged, name, value } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const [listState, setListState] = useState(list);
  const [serviceName, setServiceName] = useState("");

  return (
    <div className="w-full">
      <div>
        <input
          ref={inputRef}
          className="w-full rounded-md border-2 p-2 border-black"
          placeholder={placeholder}
          value={(() => value ?? serviceName)()}
          name={name}
          onClick={(e) => {
            setListState(list);
            if (ulRef.current) {
              const shown = ulRef.current!.classList.replace("hidden", "block");
              if (!shown) ulRef.current!.classList.replace("block", "hidden");
            }
          }}
          onChange={(e) => {
            if (textChanged) {
              textChanged(e);
            } else {
              const typed = e.currentTarget.value;
              setServiceName(typed);
              if (typed === "") {
                setListState(list);
                ulRef.current?.classList.replace("hidden", "block");
              } else {
                const updated = listState.filter((val) =>
                  val.toLowerCase().includes(typed)
                );
                if (updated.length == 0)
                  ulRef.current?.classList.replace("block", "hidden");
                setListState(updated);
              }
            }
          }}
        />
      </div>
      {list.length > 0 && (
        <ul
          ref={ulRef}
          className="mt-1 hidden w-full divide-y border bg-slate-800 p-2 text-white shadow-lg overflow-y-auto h-96"
        >
          {listState.map((value, i) => (
            <li
              className="cursor-pointer p-2"
              key={i}
              onClick={(e) => {
                if (listClicked) {
                  listClicked(e);
                } else {
                  setServiceName(e.currentTarget.innerText);
                  ulRef.current!.style.display = "none";
                }
              }}
            >
              {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EditableSelect;
