import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isPagesBuild = process.env.DEPLOY_TARGET === "pages";

const nextConfig: NextConfig = isPagesBuild
  ? {
      // Static export for the GitHub Pages preview of the hello-world.
      // This is a temporary host until production picks up Vercel (or equivalent
      // serverless-capable platform) — once we add API routes / DB this branch
      // will be removed.
      output: "export",
      basePath: "/mente-web",
      images: { unoptimized: true },
    }
  : {};

const sentryConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  telemetry: false,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
};

// Sentry's tunnel route requires server runtime, so we skip its wrapper for
// fully-static export builds. Error reporting still works via the SDK init.
export default isPagesBuild
  ? nextConfig
  : withSentryConfig(nextConfig, sentryConfig);
