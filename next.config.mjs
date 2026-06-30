/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the on-screen Next.js dev indicator (the logo badge shown during `next dev`)
  devIndicators: false,

  // Throttle static generation so the build doesn't overwhelm the (single-instance,
  // limited DB-pool) backend with a burst of concurrent fetches — which caused
  // intermittent "Upstream 5xx" prerender failures. Fewer concurrent pages + a
  // build-level retry, on top of the in-app fetch retry in src/lib/api.js.
  experimental: {
    staticGenerationRetryCount: 2,
    staticGenerationMaxConcurrency: 4,
    staticGenerationMinPagesPerWorker: 40,
  },
};

export default nextConfig;
