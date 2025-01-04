import axios from "axios";
import * as cheerio from "cheerio";
import { JSDOM } from 'jsdom';
import { NextApiRequest, NextApiResponse } from "next";

const fetchLinks = async (url: string): Promise<string[]> => {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10 seconds
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const links: string[] = [];

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        links.push(href);
      }
    });

    return Array.from(new Set(links)); // Return unique links
  } catch (error) {
    console.error("Error fetching links:", error); // Log the error
    throw new Error("Failed to fetch links.");
  }
};


const fetchImagesFromPage = async (url: string): Promise<string[]> => {
  try {
    const response = await fetch(url);

    // Check if the response is successful and if the content type is HTML
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

    // Convert relative URLs to absolute URLs
    const imageUrls = Array.from(images)
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => Boolean(src)) // Filter out null values
      .map((src) => {
        try {
          // If the src is a relative URL, resolve it to an absolute URL
          const absoluteUrl = new URL(src, url).href;
          return absoluteUrl;
        } catch (error) {
          // If the src is an invalid URL, log it and return an empty string
          console.error("Invalid image URL:", error, src);
          return "";
        }
      })
      .filter(Boolean); // Remove any empty strings caused by invalid URLs

    return imageUrls;
  } catch (error) {
    console.error("Error fetching images:", error);
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
    const links = await fetchLinks(url);

    // Step 2: Fetch images from each internal link
    const allImages: Set<string> = new Set();

    for (const link of links) {
      const fullUrl = new URL(link, url).toString(); // Ensure full URL
      const images = await fetchImagesFromPage(fullUrl);

      // Add each image URL to the set (Set automatically handles duplicates)
      images.forEach((image) => allImages.add(image));
    }

    // Step 3: Return all unique images
    res.status(200).json({ images: Array.from(allImages) });
  } catch (error) {
    console.error("Error fetching site images:", error);
    res.status(500).json({ error: "Failed to fetch all images from the site." });
  }
}
