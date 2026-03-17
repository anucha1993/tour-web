// Centralized configuration for tour-web
// Change API URL here and it will affect the entire application

export const config = {
  // API Base URL - change this when switching domains
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.nexttrip.asia/api",
  
  // Site Info
  siteName: "NextTrip Holiday",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://nexttrip.asia",
  
  // Contact Info
  phone: "02-136-9144",
  hotline: "091-091-6364",
  lineId: "@nexttripholiday",
  email: "info@nexttrip.asia",
  
  // Social Links
  social: {
    facebook: "https://facebook.com/nexttripholiday",
    instagram: "https://instagram.com/nexttripholiday",
    youtube: "https://youtube.com/@nexttripholiday",
    tiktok: "https://tiktok.com/@nexttripholiday",
    line: "https://line.me/R/ti/p/@nexttripholiday",
  },
};

// Export individual values for convenience
export const API_URL = config.apiUrl;
export const SITE_NAME = config.siteName;
export const SITE_URL = config.siteUrl;
