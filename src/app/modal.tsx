import React, { useState, useEffect } from "react";
import useStore, { RFState } from "./whiteboard/store";
import {
  XMarkIcon,
  DocumentPlusIcon,
  ArrowDownOnSquareIcon,
  ArrowLeftOnRectangleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { shallow } from "zustand/shallow";
import { isNode, isEdge } from "reactflow";
import * as amplitude from '@amplitude/analytics-browser';

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onAddNode: state.onAddNode,
  showModal: state.showModal,
  onSetShowModal: state.onSetShowModal,
  importNodesAndEdges: state.importNodesAndEdges,
  followUpModal: state.followUpModal,
  setFollowUpModal: state.setFollowUpModal,
  onAddFollowUpNode: state.onAddFollowUpNode,
  showInitModal: state.showInitModal,
  setShowInitModal: state.setShowInitModal,
  addInitNodes: state.addInitNodes,
});

export function PromptModal() {
  const { onAddNode, showModal, onSetShowModal } = useStore(selector, shallow);

  const [prompt, setPrompt] = useState("");
  const [markdownMode, setMarkdownMode] = useState(true);
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleMarkdownToggle = () => {
    setMarkdownMode((prevMode) => !prevMode);
  };

  const handlePromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    amplitude.track("new-node-submitted", { prompt: `${prompt}` });
    onAddNode({ title: prompt, markdownMode });
    setPrompt("");
    onSetShowModal(false);
  };

  return (
    <>
      {showModal && (
        <div className="absolute h-screen w-screen z-10 bg-zinc-800/50 flex justify-center items-center">
          <dialog
            open
            className="relative p-4 bg-white rounded-xl text-black min-w-[50%] max-w-[70%]"
          >
            <button
              className="absolute top-1 right-1 h-10 w-10 hover:bg-gray-200 rounded-full p-2"
              onClick={() => {
                onSetShowModal(false);
              }}
            >
              <XMarkIcon />
            </button>
            <h1 className="font-bold text-xl mb-6">Enter Prompt</h1>
            <form onSubmit={handlePromptSubmit}>
              <textarea
                placeholder="Type your text here..."
                className="w-full resize-none border border-black rounded-xl px-2 py-1
                             text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0
                             mb-4"
                rows={7}
                value={prompt}
                onChange={handleInputChange}
              ></textarea>
              <div className="mb-2 flex items-center">
                <label htmlFor="markdownToggle" className="mr-2">
                  <span>Markdown Mode</span>
                </label>
                <input
                  type="checkbox"
                  id="markdownToggle"
                  checked={markdownMode}
                  onChange={handleMarkdownToggle}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
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

export function FollowUpModal() {
  const { onAddFollowUpNode, followUpModal, setFollowUpModal, nodes } = useStore(
    selector,
    shallow
  );

  const [prompt, setPrompt] = useState("");
  const [markdownMode, setMarkdownMode] = useState(true);
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const [autoPrompts, setAutoPrompts] = useState<string[]>([]);
  useEffect(() => {
    const sourceNode = nodes.find(node => node.id === followUpModal.sourceId);
    if (sourceNode) {
      setAutoPrompts(sourceNode.data.autoPrompts || []);
    }
}, [followUpModal.sourceId, nodes]);

  const handleMarkdownToggle = () => {
    setMarkdownMode((prevMode) => !prevMode);
  };

  const handlePromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    amplitude.track("follow-up-submitted", { prompt: `${prompt}`, auto_prompt: autoPrompts.includes(prompt)});
    onAddFollowUpNode({
      title: prompt,
      sourceId: followUpModal.sourceId,
      markdownMode,
      sourceHandle: followUpModal.sourceHandle,
    });
    setPrompt("");
    setFollowUpModal({ shown: false, sourceId: "", sourceHandle: "" });
  };

  return (
    <>
      {followUpModal.shown && (
        <div className="absolute h-screen w-screen z-10 bg-zinc-800/50 flex justify-center items-center">
          <dialog
            open
            className="relative p-4 bg-white rounded-xl text-black min-w-[50%] max-w-[70%]"
          >
            <button
              className="absolute top-1 right-1 h-10 w-10 hover:bg-gray-200 rounded-full p-2"
              onClick={() => {
                setFollowUpModal({
                  shown: false,
                  sourceId: "",
                  sourceHandle: "",
                });
                setPrompt("");
              }}
            >
              <XMarkIcon />
            </button>
            <h1 className="font-bold text-xl mb-6">Enter Follow Up Prompt</h1>
            <form onSubmit={handlePromptSubmit}>
              <div className="mb-4">
                {autoPrompts.map(prompt => (
                  <button
                    type="button"
                    key={prompt}
                    className="mr-4 mb-2 px-4 py-2 rounded-xl border border-black
                        transform duration-200 hover:border-b-2 hover:border-r-2 hover:scale-105 ease-in-out"
                    onClick={() => setPrompt(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Type your text here..."
                className="w-full resize-none border border-black rounded-xl px-2 py-1
                             text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0
                             mb-4"
                rows={3}
                value={prompt}
                onChange={handleInputChange}
              ></textarea>
              <div className="mb-2 flex items-center">
                <label htmlFor="markdownToggle" className="mr-2">
                  <span>Markdown Mode</span>
                </label>
                <input
                  type="checkbox"
                  id="markdownToggle"
                  checked={markdownMode}
                  onChange={handleMarkdownToggle}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
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

export function InitModal() {
  const { addInitNodes, showInitModal, setShowInitModal } = useStore(
    selector,
    shallow
  );

  const [prompt, setPrompt] = useState("");
  const [markdownMode, setMarkdownMode] = useState(true);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleMarkdownToggle = () => {
    setMarkdownMode((prevMode) => !prevMode);
  };

  const handlePromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    amplitude.track("init-submitted", { prompt: `${prompt}` });
    addInitNodes({ topic: prompt , breadth: 4, depth: 2});
    setPrompt("");
    setShowInitModal(false);
  };

  return (
    <>
      {showInitModal && (
        <div className="absolute h-screen w-screen z-10 bg-zinc-800/50 flex justify-center items-center">
          <dialog
            open
            className="relative p-4 bg-white rounded-xl text-black min-w-[50%]"
          >
            <button
              className="absolute top-1 right-1 h-10 w-10 hover:bg-gray-200 rounded-full p-2"
              onClick={() => {
                setShowInitModal(false);
              }}
            >
              <XMarkIcon />
            </button>
            <h1 className="font-bold text-xl mb-6 mt-2">
              Enter a topic you’re curious about...
            </h1>
            <form onSubmit={handlePromptSubmit}>
              <input
                placeholder="ex: SEO optimization"
                className="w-4/5 h-16 resize-none border border-black rounded-xl px-2 py-1
                             text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0
                             mb-4"
                value={prompt}
                onChange={handleInputChange}
              />
              <div className="mb-4">
                The knowledge map takes 2-3 min to generate.
              </div>
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
