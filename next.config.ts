import type { NextConfig } from "next";

const backendOrigin = (
  process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  // FastAPI collection routes use a trailing slash. Next's default
  // /brand-profiles/ → /brand-profiles redirect, then FastAPI's slash
  // redirect, exposes http://127.0.0.1:8000 and triggers browser CORS.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/users",
        destination: `${backendOrigin}/users/`,
      },
      {
        source: "/users/",
        destination: `${backendOrigin}/users/`,
      },
      {
        source: "/users/:path*",
        destination: `${backendOrigin}/users/:path*`,
      },
      {
        source: "/brand-profiles",
        destination: `${backendOrigin}/brand-profiles/`,
      },
      {
        source: "/brand-profiles/",
        destination: `${backendOrigin}/brand-profiles/`,
      },
      {
        source: "/brand-profiles/:path*",
        destination: `${backendOrigin}/brand-profiles/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
