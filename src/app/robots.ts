import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/**
 * robots.txt — allow crawling of public content, block private/user areas
 * and internal endpoints, explicitly welcome AI answer-engine crawlers so the
 * site can be cited when users ask AI assistants for tour recommendations,
 * block competitor-analysis bots, and point crawlers to the sitemap.
 *
 * NOTE: review the AI user-agent list roughly every 6 months — these bot names
 * change and new ones appear regularly.
 */

// AI answer-engine / assistant crawlers we want to grant full access so our
// content can be referenced in AI responses (ChatGPT, Claude, Gemini, etc.).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "FacebookBot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Private / user-only areas (no SEO value, may contain personal data).
          "/member",
          "/member/",
          "/auth/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/api/",
          "/subscribe/",
          // Tracking-parameter URLs — avoid duplicate indexing of campaign links.
          "/*?*utm_",
          "/*?*fbclid",
          "/*?*gclid",
        ],
      },
      // Grant AI answer-engine crawlers full access to public content.
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: "/" })),
      // Block competitor-analysis bots that only consume server resources.
      // (If the marketing team uses these to audit our own site, remove them.)
      { userAgent: "MJ12bot", disallow: "/" },
      { userAgent: "DotBot", disallow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
