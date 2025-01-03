// import { NextApiRequest, NextApiResponse } from "next";
// import axios from "axios";
// import * as cheerio from "cheerio";
// import { URL } from "url"; // To resolve relative URLs

// type ImageData = {
//   src: string;
//   alt: string | null;
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed. Use POST." });
//   }

//   const { url } = req.body;

//   if (!url) {
//     return res.status(400).json({ error: "URL is required." });
//   }

//   try {
//     // Fetch the webpage content
//     const response = await axios.get(url);
//     const html = response.data;

//     // Parse HTML with Cheerio
//     const $ = cheerio.load(html);
//     const images: ImageData[] = [];

//     // Extract all <img> tags
//     $("img").each((_, img) => {
//       let src = $(img).attr("src") || "";
//       const alt = $(img).attr("alt") || null;

//       // Resolve relative URLs to absolute URLs
//       if (src && !src.startsWith("http")) {
//         try {
//           const absoluteUrl = new URL(src, url); // This creates an absolute URL
//           src = absoluteUrl.href;
//         } catch (error) {
//           console.error("Invalid image URL:", src, error);
//         }
//       }

//       // Push image details into the array
//       images.push({ src, alt });
//     });

//     // Send the extracted data back to the frontend
//     return res.status(200).json({ images });
//   } catch (error) {
//     console.error("Error fetching or parsing the URL:", error);
//     return res.status(500).json({ error: "Failed to analyze the webpage." });
//   }
// }
