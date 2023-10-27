export function Calender() {
  const today = new Date();
  return (
    <div className="max-h-30 min-h-full shadow-lg bg-blue-800 text-white px-4">
      <p className="text-center text-9xl font-sans font-bold">{today.getDate()}</p>
      <div className="text-center">
        <p className="text-lg">Will you be available tomorrow?</p>
        <div className="flex gap-4 justify-center text-xl">
          <button className="text-red-500">Yes</button>
          <button className="text-yellow-500">No</button>
        </div>
      </div>
    </div>
  );
}
