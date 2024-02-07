import { useRef, useState } from "react";

const EditableSelect = (props: {
  list: any[];
  placeholder: string;
  textChanged?: Function;
  name?: string;
  value?: string;
  blurred?: Function;
  listClicked?: Function;
}) => {
  const { list, placeholder, textChanged, name, value, blurred, listClicked } =
    props;
  const inputRef = useRef<HTMLInputElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const [listState, setListState] = useState(list);

  return (
    <div className="w-full">
      <div>
        <label>
          <input
            ref={inputRef}
            className="w-full rounded-md border-2 border-black p-2"
            value={value}
            name={name}
            placeholder={placeholder}
            onClick={(e) => {
              setListState(list);
              if (ulRef.current) {
                const shown = ulRef.current!.classList.replace(
                  "hidden",
                  "block"
                );
                if (!shown) ulRef.current!.classList.replace("block", "hidden");
              }
            }}
            onBlur={(e) => {
              blurred && blurred(e);
            }}
            onChange={(e) => {
              const typed = e.currentTarget.value;
              textChanged && textChanged(typed);
              if (typed === "") {
                setListState(list);
                ulRef.current?.classList.replace("hidden", "block");
              } else {
                const updated = listState.filter((val) => {
                  if (typeof val === "string")
                    return val.toLowerCase().includes(typed);
                  return val.props.children.toLowerCase().includes(typed);
                });
                if (updated.length == 0)
                  ulRef.current?.classList.replace("block", "hidden");
                setListState(updated);
              }
            }}
          />
        </label>
      </div>
      {list.length > 0 && (
        <ul
          ref={ulRef}
          className="z-50 mt-1 hidden max-h-80 w-auto divide-y overflow-y-auto border bg-slate-800 p-2 text-white shadow shadow-slate-200"
        >
          {listState.map((value, i) => (
            <li
              className="cursor-pointer p-2"
              key={i}
              id={value.id}
              onClick={(e) => {
                ulRef.current!.classList.replace("block", "hidden");
                if (typeof value === "string") {
                  listClicked && listClicked(value);
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
