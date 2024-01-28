import { Link, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
import { AppointmentCard } from "~/components/AppointmentCard";
import { prisma } from "~/db.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const parsed = new URL(request.url);
  let countAsString = parsed.searchParams.get("count");
  const id = Number(params.id);
  const count = Number(countAsString);
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + count);
  due.setHours(1, 0, 0, 0)
  return await prisma.vendor.findUnique({
    where: { id },
    select: { bookings: { take: 20, where: { dueDate: due } } },
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const id = Number(params.id);
  if (request.method === "DELETE") {
    const bookingId = await request.json();
    await prisma.vendor.update({
      where: { id },
      data: { bookings: { delete: { id: Number(bookingId.aptId) } } },
    });
    return null;
  }
  const data = await request.formData();
  return await prisma.booking.create({data: {
    purpose: data.get("purpose") as string,
    dueDate: new Date(data.get("dueDate") as string),
    vendorId: id,
    bookerName: data.get("booker") as string
  }});
};

export default function Booking() {
  const vendorWithBookings = useLoaderData<typeof loader>();
  return vendorWithBookings!.bookings.length > 0 ? (
    <div className="mx-auto mb-5 max-h-96 overflow-auto">
      <div className="flex flex-wrap justify-around gap-4">
        {vendorWithBookings!.bookings.map((b, i) => (
          <AppointmentCard key={i} apt={b} />
        ))}
      </div>
    </div>
  ) : (
    <h1 className="text-center">
      You have not yet been booked for this day,{" "}
      <Link to="/boost">Promote what you do here</Link>
    </h1>
  );
}
