"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as amplitude from '@amplitude/analytics-browser';


export default function Home() {

  const [amplitudeAPIKey, setAmplitudeAPIKey] = useState<string>('');
useEffect(() => {
  if (typeof window !== "undefined") {
    if (window.location.href.startsWith('https://www.aiknowledgemap')) {
      setAmplitudeAPIKey('9779e1a8358ae0f3fa8e7ea4396e5449');
    } else {
      setAmplitudeAPIKey('3f6ed3bd676c44ba27fb668b9cc00938');
    }
  amplitude.init(amplitudeAPIKey, undefined,
                 { defaultTracking: { sessions: true, pageViews: true}});
  }
}, [amplitudeAPIKey]);


  const router = useRouter();
  const [topic, setTopic] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };
  const handleTopicSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/graph?topic=${topic}`);
  };

  const handleWhiteboard = () => {
    amplitude.track('start-button-clicked');
    router.push(`/whiteboard`);
  };

  return (
    <main className="relative flex items-center justify-center w-screen h-screen flex-1 text-center bg-zinc-800 text-white">
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
