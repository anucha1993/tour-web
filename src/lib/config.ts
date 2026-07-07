// Centralized configuration for tour-web
// Change API URL here and it will affect the entire application

export const config = {
  // API Base URL - change this when switching domains
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.nexttripholiday.com/api",
  
  // Site Info
  siteName: "NextTrip Holiday",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexttripholiday.com",
  
  // Contact Info
  phone: "02-136-9144",
  hotline: "091-091-6364",
  lineId: "@nexttripholiday",
  email: "info@nexttripholiday.com",
  
  // Social Links
  social: {
    facebook: "https://facebook.com/nexttripholiday",
    instagram: "https://instagram.com/nexttripholiday",
    youtube: "https://youtube.com/@nexttripholiday",
    tiktok: "https://tiktok.com/@nexttripholiday",
    line: "https://line.me/R/ti/p/@nexttripholiday",
  },

  // LINE Official Account (used by the friend-gate / "add friend" flow)
  // basicId should include the leading "@" e.g. "@nexttripholiday".
  lineOa: {
    basicId: process.env.NEXT_PUBLIC_LINE_OA_ID || "@nexttripholiday",
    addFriendUrl:
      process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL ||
      "https://line.me/R/ti/p/@nexttripholiday",
  },

  // Analytics / Marketing tracking IDs.
  // Leave empty to disable a given tracker. These are injected only AFTER the
  // user grants the matching cookie-consent category (see <Analytics />).
  analytics: {
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",          // e.g. G-XXXXXXXXXX (analytics)
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",          // e.g. GTM-XXXXXXX (analytics)
    fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "", // Meta Pixel (marketing)
    tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "", // TikTok (marketing)
  },
};

// Export individual values for convenience
export const API_URL = config.apiUrl;
export const SITE_NAME = config.siteName;
export const SITE_URL = config.siteUrl;
