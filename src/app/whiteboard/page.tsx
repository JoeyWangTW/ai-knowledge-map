"use client";

import React, { useState } from "react";
import Whiteboard from "./whiteboard";
import useStore from "./store";
import { XMarkIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { shallow } from "zustand/shallow";

const selector = (state) => ({
  onAddNode: state.onAddNode,
  showModal: state.showModal,
  onSetShowModal: state.onSetShowModal,
});

function PromptModal({
  setShowPromptModal,
}: {
  setShowPromptModal: () => void;
}) {
  const { onAddNode, showModal, onSetShowModal } = useStore(selector, shallow);

  const [prompt, setPrompt] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };
  const handlePromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAddNode();
  };

  return (
    <>
      {showModal && (
        <div className="absolute h-screen w-screen z-10 bg-zinc-800/50 flex justify-center items-center">
          <dialog
            open
            className="relative p-4 bg-white rounded-xl text-black min-w-[50%]"
          >
            <button
              className="absolute top-1 right-1 h-10 w-10 hover:bg-gray-200 rounded-full p-2"
              onClick={() => {
                onSetShowModal(false);
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
      )}
    </>
  );
}

function NewNodeButton() {
  const { onSetShowModal } = useStore(selector, shallow);

  return (
    <button
      className="absolute top-5 left-5 h-10 w-10 text-zinc-800 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
      onClick={() => {
        onSetShowModal(true);
      }}
    >
      <DocumentPlusIcon />
    </button>
  );
}

export default function Home() {
  return (
    <main className="font-sans flex items-center justify-center w-screen h-screen flex-1 text-center relative">
      <Whiteboard />
      <PromptModal />
      <NewNodeButton />
    </main>
  );
}
