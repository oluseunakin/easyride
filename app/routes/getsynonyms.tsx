import type { ActionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import { findSynonym } from "~/models/synonym.server";
import { getSynonymsFromOpenAI } from "~/models/vendor.server";

export const action = async ({ request }: ActionArgs) => {
  const service = (await request.formData()).get("service") as string;
  if (service.length > 0) {
    try {
      const synonyms = await getSynonymsFromOpenAI(service);
      const synonym = synonyms.map(async (synonym) => await findSynonym(synonym))
      if (synonym.length > 0) return { service: (await synonym[0])?.service };
      else {
        await prisma.$transaction(
          synonyms.map((synonym) =>
            prisma.synonym.create({
              data: {
                name: synonym,
                service: {
                  connectOrCreate: {
                    where: { name: service },
                    create: { name: service },
                  },
                },
              },
            })
          )
        );
        return { service };
      }
    } catch (e) {
      return {service}
    }
  }
  return null;
};
