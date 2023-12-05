import { useFetcher } from "@remix-run/react";

export function AppointmentCard(props: { apt: any }) {
  const { apt } = props;
  let dueHour = apt.dueHour;
  let amOrPm = "A.M";
  if (dueHour >= 12) {
    amOrPm = "P.M";
    dueHour = dueHour == 12 ? 12 : dueHour - 12;
  }
  const cancel = useFetcher();
  return (
    <div className="bg-stone-700 p-2 text-gray-200">
      <p className="text-center text-7xl font-bold leading-relaxed text-white">
        <span>{dueHour}</span>
        <span className="mx-2">:</span>
        <span className="mr-4">{apt.dueMinute}</span>
        <span>{amOrPm}</span>
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
