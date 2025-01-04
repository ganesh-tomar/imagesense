"use client";
import type { NextPage } from "next";
import ImageScanner from "../components/scan-images";
import LinkFetcher from "../components/fetch-links";
import AllImagesFetcher from "../components/fetch-all-images";

const Home: NextPage = () => {
  return (
    <>
      <AllImagesFetcher />
      <ImageScanner />
      <LinkFetcher />
    </>
  );
};

export default Home;
