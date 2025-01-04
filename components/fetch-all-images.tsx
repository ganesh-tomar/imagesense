import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchImages = async (): Promise<void> => {
    setError("");
    setImages([]);
    setLoading(true);

    if (!url) {
      setError("Please enter a valid URL.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/fetch-all-images?url=${encodeURIComponent(url)}`
      );
      const data: { images?: string[]; error?: string } = await response.json();

      if (response.ok && data.images) {
        setImages(data.images);
      } else {
        setError(data.error || "Failed to fetch images.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred while scanning the URL.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[100vh] py-[100px] bg-gray-100">
      <div className="container h-full">
        <div className="w-full h-full flex-col flex flex-wrap items-center justify-center">
          <h1 className="text-2xl font-bold mb-6">Image Fetcher Tool</h1>
          <div className="w-full flex justify-center">
            <input
              className="h-[50px] w-[300px] py-[10px] px-[15px] rounded-lg border border-gray-400"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL"
            />
            <button
              className="ml-[20px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              onClick={fetchImages}
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch Images"}
            </button>
          </div>

          {error && (
            <p className="text-red-600 mt-4 font-semibold">{error}</p>
          )}

          {images.length > 0 && (
            <div className="mt-8 w-full">
              <h2 className="text-xl font-semibold mb-4">
                Found {images.length} images:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="border rounded-md overflow-hidden shadow-md"
                  >
                    <img
                      src={image}
                      alt={`Fetched Image ${index + 1}`}
                      className="w-full h-[150px] object-cover"
                    />
                    <a
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-blue-600 hover:underline py-2"
                    >
                      View Image
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
