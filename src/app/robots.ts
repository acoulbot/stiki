import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hittabak.ru";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/account", "/cart", "/compare", "/wishlist"],
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/account", "/cart", "/compare", "/wishlist"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
