import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://kashant-csilan.vercel.app/sitemap.xml",
  };
}
