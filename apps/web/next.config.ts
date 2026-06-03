import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TS source; let Next transpile them.
  transpilePackages: ["@qazquiz/ui", "@qazquiz/trpc", "@qazquiz/types", "@qazquiz/db"],
  experimental: {
    typedRoutes: true,
  },
};

export default config;
