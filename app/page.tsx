'use client'
import type { NextPage } from "next";
import ToolUi from '../components/ToolUi';
import ImageScanner from "../components/scan-images";

const Home: NextPage = () => {
  return (
 <section className="main">
  <div className="container">
    <div className="innerWrap">
      <ImageScanner/>
      {/* <ToolUi/> */}
      {/* <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Enter URL"
            className="input"
            id="searchInput"
          />
         <span
            className="clear-button"
            onClick={() => {
              const inputElement = document.getElementById("searchInput") as HTMLInputElement;
              if (inputElement) {
                inputElement.value = "";
              }
            }}
          >
            ✕
          </span>
        </div>
        <button className="button">Scan</button>
      </div> */}
    </div>
  </div>
</section>

  );
};

export default Home;
