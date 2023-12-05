import type { ModalState } from "~/types";

export const Modal = (props: {
  setModalState: React.Dispatch<any>;
  modalState: ModalState;
}) => {
  const { setModalState, modalState } = props;
  return (
    <div className="fixed bottom-2 left-3 right-3 top-2 z-40 rounded-xl bg-slate-700 shadow-2xl shadow-slate-900 sm:left-10 sm:right-10 md:left-20 md:right-20">
      <div className="m-3 mb-1 flex">
        <button
          className=""
          onClick={() => {
            setModalState({type: "back"})
          }}
        >
          <span className="material-symbols-outlined text-white">
            arrow_back_ios
          </span>
        </button>
        <button
          className="flex flex-grow justify-end"
          onClick={() => {
            setModalState({ type: "close" });
          }}
        >
          <span className="material-symbols-outlined text-red-500">close</span>
        </button>
      </div>
      {modalState.children[modalState.index]}
    </div>
  );
};
