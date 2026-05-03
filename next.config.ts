import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Sentry tunnels through this route to bypass ad-blockers in production.
  // Source maps and instrumentation are wired by withSentryConfig below.
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  telemetry: false,
  // Skip the SDK plugin work entirely when DSN/auth aren't configured (local dev, CI).
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
