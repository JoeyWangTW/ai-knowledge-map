"use client";

import React, { useState } from "react";
import Whiteboard from "./whiteboard";
import useStore, { RFState } from "../whiteboard/store";
import { XMarkIcon, DocumentPlusIcon, ArrowDownOnSquareIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { shallow } from "zustand/shallow";

const selector = (state: RFState) => ({
  onAddNode: state.onAddNode,
  showModal: state.showModal,
  onSetShowModal: state.onSetShowModal,
});

function PromptModal() {
  const { onAddNode, showModal, onSetShowModal } = useStore(selector, shallow);

  const [prompt, setPrompt] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };
  const handlePromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sourceNodeId = "";
    onAddNode({ title: prompt, sourceNodeId });
    onSetShowModal(false);
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
                className="w-full resize-none border border-black rounded-xl px-2 py-1
                                   text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0
                                   mb-4"
                rows={7}
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
      className="group relative h-10 w-max text-zinc-800 bg-gray-100 hover:bg-gray-200 rounded-full
                 focus:outline-none transition-all duration-200 ease-out"
      onClick={() => {
        onSetShowModal(true);
      }}
    >
      <div className="flex items-center ">
        <DocumentPlusIcon className="h-10 w-10 p-2"/>
        <span className="hidden group-hover:inline-block transform transition-all duration-200 ease-out pr-2">
          Add New Block
        </span>
      </div>
    </button>
  );
}

function ImportButton() {
  return (
    <button
      className="group relative h-10 w-max text-zinc-800 bg-gray-100 hover:bg-gray-200 rounded-full
                 focus:outline-none transition-all duration-200 ease-out"
      onClick={() => {
        alert("export");
      }}
    >
      <div className="flex items-center ">
        <ArrowLeftOnRectangleIcon className="h-10 w-10 p-2"/>
        <span className="hidden group-hover:inline-block transform transition-all duration-200 ease-out pr-2">
          Import
        </span>
      </div>
    </button>
  );
}

function ExportButton() {
  return (
    <button
      className="group relative h-10 w-max text-zinc-800 bg-gray-100 hover:bg-gray-200 rounded-full focus:outline-none transition-all duration-200 ease-out"
      onClick={() => {
        alert("export");
      }}
    >
      <div className="flex items-center ">
        <ArrowDownOnSquareIcon className="h-10 w-10 p-2"/>
        <span className="hidden group-hover:inline-block transform transition-all duration-200 ease-out pr-2">
          Export
        </span>
      </div>
    </button>
  );
}


export default function Home() {
  return (
    <main className="font-sans flex items-center justify-center w-screen h-screen flex-1 text-center relative">
      <Whiteboard />
      <PromptModal />
      <div className="absolute top-5 left-5 flex flex-col space-y-4">
        <ImportButton/>
        <ExportButton/>
        <NewNodeButton />
      </div>
    </main>
  );
}
