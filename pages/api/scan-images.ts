import { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';

interface ImageInfo {
  src: string;
  alt: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Handler is called....");

  // Check if URL is provided in query
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    console.log("No valid URL provided");
    return res.status(400).json({ error: 'Invalid URL provided.' });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    console.log("HTML fetched successfully");

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      return res.status(400).json({ error: 'The URL did not return a valid HTML document.' });
    }

    const dom = new JSDOM(html);
    const images = dom.window.document.querySelectorAll('img');

    const altAttributes = Array.from(images).map((img) => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || 'No alt attribute',
    }));

    return res.status(200).json(altAttributes);
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return res.status(500).json({ error: 'An internal error occurred.' });
  }
}
