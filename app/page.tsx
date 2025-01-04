"use client";
import type { NextPage } from "next";
import ImageScanner from "../components/scan-images";
import LinkFetcher from "../components/fetch-links"

const Home: NextPage = () => {
  return (
    <>
      <ImageScanner />
      <LinkFetcher />
    </>
  );
};

export default Home;
