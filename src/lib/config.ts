export const siteConfig = {
  name: "Ontario Farm Shows",
  description:
    "Discover farm shows, agricultural fairs, and farming events across Ontario. Interactive map, dates, locations, and details for every farm show in the province.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ontariofarmshow.com",
  ogImage: "/images/og-default.jpg",
  links: {
    email: "hello@ontariofarmshow.com",
  },
} as const;
