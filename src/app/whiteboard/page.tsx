"use client";

import React, { useState, useRef } from "react";
import Whiteboard from "./whiteboard";
import { PromptModal, FollowUpModal, InitModal } from "../modal";
import useStore, { RFState } from "../whiteboard/store";
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
});

function NewNodeButton() {
  const { onSetShowModal } = useStore(selector, shallow);
  return (
    <button
      className="group relative h-10 w-max text-zinc-800 bg-gray-100 hover:bg-gray-200 rounded-full
                 focus:outline-none transition-all duration-200 ease-out"
      onClick={() => {
        amplitude.track("new-node-started")
        onSetShowModal(true);
      }}
    >
      <div className="flex items-center ">
        <DocumentPlusIcon className="h-10 w-10 p-2" />
        <span className="hidden group-hover:inline-block transform transition-all duration-200 ease-out pr-2">
          Add New Block
        </span>
      </div>
    </button>
  );
}

function ImportButton() {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const { importNodesAndEdges, nodes, edges } = useStore(selector, shallow);
  const onImportButtonClicked = () => {
    hiddenFileInput.current?.click();
  };
  const graphExists = nodes.length !== 0 || edges.length !== 0;

  const onImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          try {
            const importedData = JSON.parse(e.target.result as string);
            console.log(importedData);
            const importedNodes = importedData.nodes;
            const importedEdges = importedData.edges;
            if (
              Array.isArray(importedNodes) &&
              Array.isArray(importedEdges) &&
              importedNodes.every((el) => isNode(el)) &&
              importedEdges.every((el) => isEdge(el))
            ) {
              amplitude.track("graph-imported");
              importNodesAndEdges(importedNodes, importedEdges);
            } else {
              alert(
                "We couldn't import your data.\
Ensure the file is in JSON format and has the correct structure for nodes and edges. \
For help, check our documentation or contact support."
              );
              console.error("Invalid data format");
            }
          } catch (err) {
            alert(
              "We couldn't import your data.\
Ensure the file is in JSON format and has the correct structure for nodes and edges. \
For help, check our documentation or contact support."
            );
            console.error("Error parsing JSON:", err);
          }
        }
      };
      reader.readAsText(file);
    } else {
      alert("No files were provided");
      console.error("No files were provided");
    }
    event.target.value = "";
  };
  return (
    <>
      <button
        className="group relative h-10 w-max text-zinc-800 bg-gray-100 hover:bg-gray-200 rounded-full
                   focus:outline-none transition-all duration-200 ease-out
                   disabled:text-zinc-400"
        onClick={onImportButtonClicked}
        disabled={graphExists}
      >
        <div className="flex items-center ">
          <ArrowLeftOnRectangleIcon className="h-10 w-10 p-2" />
          <span className="hidden group-hover:inline-block transform transition-all duration-200 ease-out pr-2">
            {graphExists ? "Import only allowed on empty graph" : "Import"}
          </span>
        </div>
      </button>
      <input
        type="file"
        ref={hiddenFileInput}
        accept=".json"
        onChange={onImport}
        className="hidden"
      />
    </>
  );
}

function ExportButton() {
  const { nodes, edges } = useStore(selector, shallow);
  const onExport = () => {
    amplitude.track("graph-exported");
    const serializedData = JSON.stringify({ nodes: nodes, edges: edges });
    const blob = new Blob([serializedData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "export.json";
    link.click();
  };
  return (
    <button
      className="group relative h-10 w-max text-zinc-800 bg-gray-100 hover:bg-gray-200 rounded-full focus:outline-none transition-all duration-200 ease-out"
      onClick={onExport}
    >
      <div className="flex items-center ">
        <ArrowDownOnSquareIcon className="h-10 w-10 p-2" />
        <span className="hidden group-hover:inline-block transform transition-all duration-200 ease-out pr-2">
          Export
        </span>
      </div>
    </button>
  );
}

const SurveyButton = () => {
  const openSurvey = () => {
    window.open("https://forms.gle/pKy8LD7j3RpifwTT8", "_blank");
  };

  return (
    <button
      className="h-10 w-10 p-2 text-gray-200 hover:text-zinc-800 hover:bg-gray-200 rounded-full focus:outline-none"
      onClick={openSurvey}
    >
      <QuestionMarkCircleIcon />
    </button>
  );
};

export default function Home(){

  let amplitudeAPIKey;

  if (window.location.href.startsWith('https://www.aiknowledgemap')) {
    amplitudeAPIKey = '9779e1a8358ae0f3fa8e7ea4396e5449';
  } else {
    amplitudeAPIKey = '3f6ed3bd676c44ba27fb668b9cc00938';
  }

  amplitude.init(amplitudeAPIKey, undefined,
                 { defaultTracking: { sessions: true, pageViews: true}});
  return (
    <main className="font-sans flex items-center justify-center w-screen h-screen flex-1 text-center relative">
      <Whiteboard />
      <InitModal />
      <PromptModal />
      <FollowUpModal />
      <div className="absolute top-5 left-5 flex flex-col space-y-4">
        <ImportButton />
        <ExportButton />
        <NewNodeButton />
      </div>
      <div className="absolute top-5 right-5">
        <SurveyButton />
      </div>
    </main>
  );
}
