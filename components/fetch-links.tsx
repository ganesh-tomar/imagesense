import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [links, setLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchLinks = async (): Promise<void> => {
    setError("");
    setLinks([]);
    setLoading(true);

    if (!url) {
      setError("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch(
        `/api/fetch-links?url=${encodeURIComponent(url)}`
      );
      const data: { links?: string[]; error?: string } = await response.json();

      if (response.ok && data.links) {
        setLinks(data.links);
      } else {
        setError(data.error || "Failed to fetch links.");
      }
    } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "An error occurred while scanning the URL.");
        } else {
          setError("An unknown error occurred.");
        }
      }finally {
        setLoading(false);
      }
  };

  return (
    <section className="min-h-[100vh] bg-gray-400">
      <div className="container h-full">
        <div className="w-full h-full flex-col flex flex-wrap items-center justify-center">
          <h1>Link Fetcher Tool</h1>
          <div className="w-full flex justify-center">
            <input
              className="h-[50px] w-[300px] py-[10px] pl-[10px] pr-[25px] rounded-lg"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL"
            />
              <button className="button ml-[20px]" onClick={fetchLinks} disabled={loading}>
              {loading ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {error && <p className="text-red-600 p-[30px]">{error}</p>}
          {links.length > 0 && (
            <ul>
              {links.map((link, index) => (
                <li key={index}>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
