import { useState } from "react";
import Image from "next/image";

interface ImageInfo {
  src: string;
  alt: string | null;
}

const ImageScanner: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleClearInput = () => {
    setUrl("");
    setImages([]);
    setError("");
  };

  const handleScan = async () => {
    if (url.trim() === "") {
      alert("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError("");
    setImages([]);

    try {
      // Make a request to the API route
      const response = await fetch(`/api/scan-images?url=${encodeURIComponent(url)}`);
      console.log(response);

      if (!response.ok) {
        const errorText = await response.text(); // Read the HTML response
        console.error("Error response body:", errorText);
        throw new Error("Failed to fetch images. Please check the URL.");
      }

      const data: ImageInfo[] = await response.json();
      setImages(data);
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
    <section className="main">
      <div className="container">
        <div className="innerWrap">
          <h1>Alt Tag Checker</h1>
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Enter URL"
                className="input"
                value={url}
                onChange={handleInputChange}
              />
              {url && (
                <span className="clear-button" onClick={handleClearInput}>
                  ✕
                </span>
              )}
            </div>
            <button className="button" onClick={handleScan} disabled={loading}>
              {loading ? "Scanning..." : "Scan"}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
          {images.length > 0 && (
            <div className="results mt-6">
              <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-600">Image Results:</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image, index) => {
                  const isAltMissing = !image.alt;
                  const imageUrl = image.src.startsWith("http") ? image.src : `${url}${image.src}`; // Check if src starts with 'http', else prepend the URL.

                  return (
                    <li
                      key={index}
                      className={`flex flex-col items-center p-4 rounded-lg shadow-lg transform transition-all bg-white hover:bg-[#619EA8] hover:!text-white ease-in-out delay-150 text-black ${isAltMissing ? "bg-red-500 text-white" : ""
                        } scale-none hover:scale-105 hover:shadow-xl cursor-pointer`}
                    >
                    <div className="w-auto max-w-[120px] h-[100px] mb-[30px]">
                    <img
                        src={imageUrl}
                        alt={image.alt || "No alt text"}
                        className="w-full h-auto max-w-[120px] max-h-[110px]  mb-3 rounded-lg "
                        style={{ maxWidth: "120px" }}
                      />
                       {/* <Image
                      src={imageUrl}
                      alt={image.alt || "No alt text"}
                      className="w-full h-auto max-w-[120px] max-h-[110px] mb-3 rounded-lg"
                      width={100} height={100}
                    /> */}
                    </div>
                      <p className={`text-lg font-medium text-center ${isAltMissing ? "text-white" : "text-gray-700"}`}>
                        <strong className="font-semibold">Alt:</strong> {image.alt || "Missing"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}


        </div>
      </div>
    </section>
  );
};

export default ImageScanner;
