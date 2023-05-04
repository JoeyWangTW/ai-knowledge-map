"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import va from "@vercel/analytics";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };
  const handleTopicSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    va.track("topic_submitted", { topic: `${topic}` });
    router.push(`/graph?topic=${topic}`);
  };

  const handleWhiteboard = () => {
    router.push(`/whiteboard`);
  };

  return (
    <main className="relative flex items-center justify-center w-screen h-screen flex-1 text-center bg-zinc-800 text-white">
      <Analytics />
      <div className="absolute bg-[url('/landing_page_bg.png')] bg-center bg-no-repeat bg-cover bg-/2
                      h-screen w-screen opacity-5 -z-1"></div>
      <div className="relative w-3/5-md w-4/5-xs z-10 rounded-3xl p-10">
        <h1 className="relative text-5xl mb-4 z-10">Transform your brainstorming with </h1>
        <h1 className="relative font-bold text-8xl mb-10 z-10"> AI-powered Diagrams</h1>
        <button
          onClick={handleWhiteboard}
          className="font-bold rounded-xl text-md p-4 bg-gray-200 text-black mt-4 transform hover:scale-110 transition duration-300 ease-in-out"
        >
          Start Exploring Now
        </button>
      </div>
    </main>
  );
}
