import axios from "axios";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import { NextApiRequest, NextApiResponse } from "next";

const fetchLinks = async (url: string): Promise<string[]> => {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10 seconds
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const links: string[] = [];

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href && !href.startsWith("javascript:") && !href.startsWith("#")) {
        try {
          // Resolve relative URLs to absolute URLs
          const absoluteUrl = new URL(href, url).href;
          links.push(absoluteUrl);
        } catch {
          // Ignore invalid URLs
        }
      }
    });

    return Array.from(new Set(links)); // Return unique links
  } catch (error) {
    console.error("Error fetching links:", error);
    throw new Error("Failed to fetch links.");
  }
};

const fetchImagesFromPage = async (url: string): Promise<string[]> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      throw new Error("The URL did not return a valid HTML document.");
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const images = dom.window.document.querySelectorAll("img");

    const imageUrls = Array.from(images)
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => Boolean(src)) // Filter out null values
      .map((src) => {
        try {
          const absoluteUrl = new URL(src, url).href;
          return absoluteUrl;
        } catch {
          return ""; // Skip invalid URLs
        }
      })
      .filter(Boolean); // Remove empty strings

    return imageUrls;
  } catch (error) {
    console.error(`Error fetching images from ${url}:`, error);
    return [];
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL provided." });
  }

  try {
    // Step 1: Fetch all links from the base URL
    console.log(`Fetching links from: ${url}`);
    const links = await fetchLinks(url);

    // Step 2: Fetch images from each link
    const allImages: Set<string> = new Set();

    console.log(`Found ${links.length} links. Fetching images from each link...`);
    for (const link of links) {
      console.log(`Fetching images from: ${link}`);
      const images = await fetchImagesFromPage(link);

      // Add images to the set (to ensure uniqueness)
      images.forEach((image) => allImages.add(image));
    }

    // Step 3: Return all unique images
    console.log(`Fetched ${allImages.size} unique images.`);
    res.status(200).json({ images: Array.from(allImages) });
  } catch (error) {
    console.error("Error fetching images from site:", error);
    res.status(500).json({ error: "Failed to fetch all images from the site." });
  }
}
