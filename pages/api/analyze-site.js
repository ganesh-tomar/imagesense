// pages/api/analyze-site.js

import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import pLimit from "p-limit";

const limit = pLimit(3);
const cache = new Map(); // In-memory cache for results

const ANALYSIS_TIMEOUT = 60000; // 60 seconds

async function checkLinkStatus(link) {
  // Skip unsupported link schemes (like 'tel:', 'mailto:', etc.)
  const unsupportedSchemes = ["tel:", "mailto:", "ftp:", "file:"];

  if (unsupportedSchemes.some((scheme) => link.startsWith(scheme))) {
    return 400; // Default status for unsupported links
  }

  try {
    const response = await fetch(link, { method: "HEAD" });
    return response.status;
  } catch (error) {
    // return 400; // Default to 400 if an error occurs
    console.log(error);
  }
}

async function analyzeSinglePage(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const links = [];
    const issueTypes = { "404 Not Found": 0, "400 Bad Request": 0 };
    const linkTypes = { "<a href>": 0 };
    const hosts = new Set();

    const anchorElements = Array.from(document.querySelectorAll("a"));

    const processLink = async (a) => {
      const href = a.getAttribute("href");
      if (href) {
        const absoluteUrl = new URL(href, url).href;
        const status = await checkLinkStatus(absoluteUrl);

        if (status === 404) {
          issueTypes["404 Not Found"]++;
        } else if (status === 400) {
          issueTypes["400 Bad Request"]++;
        }

        links.push({ url: absoluteUrl, status });
        linkTypes["<a href>"]++;
        hosts.add(new URL(absoluteUrl).hostname);
      }
    };

    await Promise.all(anchorElements.map((a) => limit(() => processLink(a))));

    const result = {
      links,
      totalLinks: links.length,
      hosts: Array.from(hosts),
      issueTypes,
      linkTypes,
      startUrl: url,
    };

    cache.set(url, result);

    return result;
  } catch (err) {
    console.error("Error analyzing single page:", err);
  }
}

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL provided." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT);

  try {
    const pageData = await analyzeSinglePage(url);
    clearTimeout(timeout);
    return res.status(200).json(pageData);
  } catch (err) {
    clearTimeout(timeout);
    console.error("API handler error:", err);
    return res.status(504).json({
      error: "The target website took too long to respond or failed.",
    });
  }
}
