import axios from "axios";
import * as cheerio from "cheerio";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  console.log("API called with URL:", url);

  if (!url || typeof url !== "string" || !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)) {
    return res.status(400).json({ error: "Invalid URL provided." });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10 seconds
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const baseUrl = new URL(url);
    const links: string[] = [];

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        try {
          const resolvedUrl = new URL(href, baseUrl);
          if (resolvedUrl.protocol === "http:" || resolvedUrl.protocol === "https:") {
            links.push(resolvedUrl.href);
          }
        } catch {
          console.warn(`Skipping invalid URL: ${href}`);
        }
      }
    });    

    const uniqueLinks = Array.from(new Set(links));
    console.log(`Found ${uniqueLinks.length} unique links.`);
    res.status(200).json({ links: uniqueLinks });
  } catch (error) {
    console.error("Error fetching the URL:", error);
    res.status(500).json({ error: "Failed to fetch the links. Check server logs for details." });
  }
}
