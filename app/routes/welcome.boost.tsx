import type { ActionArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { prisma } from "~/db.server";

export const action = async ({ request }: ActionArgs) => {
  const fd = await request.formData();
  const vendorId = Number(fd.get("vendorid") as string);
  return await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { name: true, id: true },
  });
};

export default function Boost() {
  const vendor = useActionData<typeof action>();
  if (vendor) {
    return (
      <div>
        <h1>Welcome {vendor.name}</h1>
        <em>Choose from the available packages!!!</em>
      </div>
    );
  }
  return <h1>Vendor not found</h1>;
}
