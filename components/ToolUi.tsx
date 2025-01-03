import React, { useState } from "react";
type ImageData = {
    src: string;
    alt: string | null;
  };
  
  
const AltChecker = () => {
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ImageData[]>([]);


  const handleAnalyze = async () => {
    if (!url) {
      alert("Please enter a valid URL");
      return;
    }
  
    setIsLoading(true);
    setResults([]);
  
    try {
      const response = await fetch("/pages/api/analyze.ts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "An unknown error occurred.");
        return;
      }
  
      const data = await response.json();
      setResults(data.images || []);
    } catch (error) {
      console.error("Error analyzing the URL:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Alt Tag Checker
        </h1>
        <input
          type="url"
          placeholder="Enter a webpage URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className={`mt-4 w-full px-4 py-2 text-white font-semibold rounded-md shadow-md ${
            isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          } focus:outline-none`}
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* Results Section */}
      <div className="mt-6 w-full max-w-4xl">
        {results.length > 0 ? (
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className="py-2 px-4">Image</th>
                <th className="py-2 px-4">Alt Text</th>
                <th className="py-2 px-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {results.map((img, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4">
                    <img
                      src={img.src}
                      alt="Preview"
                      className="w-16 h-16 object-cover"
                    />
                  </td>
                  <td className="py-2 px-4">
                    {img.alt || <span className="text-red-500">Missing</span>}
                  </td>
                  <td className="py-2 px-4 text-blue-500 underline break-all">
                    <a href={img.src} target="_blank" rel="noopener noreferrer">
                      {img.src}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center mt-4 mb-6">
            {isLoading ? "Analyzing..." : "No results to display yet."}
          </p>
        )}
      </div>
    </div>
  );
};

export default AltChecker;
