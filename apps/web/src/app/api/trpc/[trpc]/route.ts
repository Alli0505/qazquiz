import { appRouter, createTRPCContext } from "@qazquiz/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { getSession } from "~/lib/auth";

const handler = async (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () =>
      createTRPCContext({
        session: await getSession(req.headers),
        headers: req.headers,
      }),
  });

export { handler as GET, handler as POST };
