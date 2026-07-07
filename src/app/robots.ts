import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/**
 * robots.txt — allow crawling of public content, block private/user areas
 * and internal endpoints, and point crawlers to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/member",
          "/member/",
          "/auth/",
          "/login",
          "/register",
          "/reset-password",
          "/api/",
          "/subscribe/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
