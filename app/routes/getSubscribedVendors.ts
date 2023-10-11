/* import type { GetResult } from "@prisma/client/runtime";
import type { ActionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";

export const action = async ({ request }: ActionArgs) => {
  const fd = await request.formData();
  const subscribedServices:
    | (GetResult<
        {
          name: string;
        },
        { [x: string]: () => unknown }
      > & {})[]
    | undefined = JSON.parse(fd.get("subscribedServices") as string);
  if (!subscribedServices || subscribedServices.length == 0) return [];
  let promisedVendors = subscribedServices.map(async (service) => {
    return {
      serviceName: service.name,
      vendors: await prisma.vendor.findMany({
        where: { serviceName: service.name },
        include: { contact: true, cover: true },
      }),
    };
  });
  if (fd.has("location")) {
    const location = fd.get("location") as string;
    promisedVendors = subscribedServices.map(async (service) => {
      return {
        serviceName: service.name,
        vendors: await prisma.vendor.findMany({
          where: { location, serviceName: service.name },
          include: { contact: true, cover: true },
        }),
      };
    });
  }
  const vendors = await Promise.all(promisedVendors);
  return vendors;
};
 */