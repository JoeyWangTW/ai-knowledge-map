"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import va from "@vercel/analytics";

const OpenAIStream: React.FC = () => {
  const [generatedJoke, setGeneratedJoke] = useState<String>("");
  const [loading, setLoading] = useState("true");
  const prompt = "tell me a story";

  const generateJoke = async (e: any) => {
    setGeneratedJoke("");
    setLoading(true);
    const response = await fetch("/api/custom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      console.warn(value);
      const chunkValue = decoder.decode(value);
      setGeneratedJoke((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  useEffect(() => {
    generateJoke();
  }, []);

  return (
    <div>
      <p className="text-white">{generatedJoke}</p>
    </div>
  );
};

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

  return (
    <main className="font-mono flex items-center justify-center w-screen h-screen flex-1 text-center bg-zinc-800 text-white">
      <Analytics />
      <div>
        <h1 className="text-5xl py-6">Enter a Topic to Start Exploring</h1>
        <form onSubmit={handleTopicSubmit}>
          <div>
            <input
              className="px-2 w-96 rounded-lg border border-white border-1 mb-4 h-10 text-black"
              placeholder="Ex: Lean Startup"
              onChange={handleInputChange}
            ></input>
          </div>
          <button
            type="submit"
            className="w-96 rounded-xl border border-white p-4 hover:border-b-2 hover:border-r-2"
          >
            Create Knowledge Map
          </button>
        </form>
      </div>
    </main>
  );
}
