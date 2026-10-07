const SITE_URL = "https://niryana-jewels-iota.vercel.app";

// Next.js App Router convention: this file auto-generates /robots.txt
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
