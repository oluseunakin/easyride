import { useFetcher } from "@remix-run/react";

export function AppointmentCard(props: { apt: any }) {
  const { apt } = props;
  const aptDate = new Date(apt.dueDate)
  const cancel = useFetcher();
  return (
    <div className="bg-slate-600 p-2 text-gray-200">
      <p className="text-center text-5xl font-bold leading-relaxed text-white flex justify-around">
        <span>{aptDate.getDate()}</span>
        <span>{aptDate.getMonth()+1}</span>
        <span>{aptDate.getFullYear()}</span>
      </p>
      <p className="mb-2 text-center font-bold">{apt.username}</p>
      <div className="m-4 flex gap-4">
        <p className="flex-grow">{apt.purpose}</p>
        <button
          className="rounded-md text-red-600"
          onClick={() => {
            cancel.submit(JSON.stringify({ aptId: apt.id }), {
              method: "DELETE",
              encType: "application/json",
            });
          }}
        >
          <span className="material-symbols-outlined">do_not_disturb_on</span>
        </button>
      </div>
    </div>
  );
}
