"use client";

import React, { useState } from "react";
import Whiteboard from "./whiteboard";
import useStore from "./store";
import { XMarkIcon } from "@heroicons/react/24/outline";

function PromptModal({
  setShowPromptModal,
}: {
  setShowPromptModal: () => void;
}) {
  const [topic, setTopic] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };
  const handlePromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(topic);
  };

  return (
    <div className="absolute h-screen w-screen z-10 bg-zinc-800/50 flex justify-center items-center">
      <dialog
        open
        className="relative p-4 bg-white rounded-xl text-black min-w-[50%]"
      >
        <button
          className="absolute top-1 right-1 h-10 w-10 hover:bg-gray-200 rounded-full p-2"
          onClick={() => {
            setShowPromptModal(false);
          }}
        >
          <XMarkIcon />
        </button>
        <h1 className="font-bold text-xl mb-6">Enter Your Prompt</h1>
        <form onSubmit={handlePromptSubmit}>
          <textarea
            placeholder="Type your text here..."
            class="w-full resize-none border border-black rounded-xl px-2 py-1
                                   text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0
                                   mb-4"
            rows="7"
            onChange={handleInputChange}
          ></textarea>
          <button
            type="submit"
            className="rounded-xl border border-black p-4 hover:border-b-2 hover:border-r-2"
          >
            Submit
          </button>
        </form>
      </dialog>
    </div>
  );
}

export default function Home() {
  const [showPromptModal, setShowPromptModal] = useState(true);
  return (
    <main className="font-sans flex items-center justify-center w-screen h-screen flex-1 text-center relative">
      <Whiteboard />
      {showPromptModal && (
        <PromptModal setShowPromptModal={setShowPromptModal} />
      )}
    </main>
  );
}
