import ReactMarkdown from "react-markdown";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import ReactFlow, {
  Background,
  useNodesState,
  ReactFlowProvider,
  useEdgesState,
  addEdge,
  useReactFlow,
  Handle,
  NodeResizeControl,
  Position,
  NodeResizer,
} from "reactflow";
import { PlusIcon, TrashIcon, LinkIcon } from "@heroicons/react/24/outline";
import useStore, { RFState } from "../whiteboard/store";
import { shallow } from "zustand/shallow";
import * as amplitude from '@amplitude/analytics-browser';

const selector = (state: RFState) => ({
  onUpdateNodeContent: state.onUpdateNodeContent,
  setFollowUpModal: state.setFollowUpModal,
  onDeleteNode: state.onDeleteNode,
});

function ResizeIcon() {
  return (
    <div className="absolute right-4 bottom-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="#000000"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <polyline points="16 20 20 20 20 16" />
        <line x1="14" y1="14" x2="20" y2="20" />
        <polyline points="8 4 4 4 4 8" />
        <line x1="4" y1="4" x2="10" y2="10" />
      </svg>
    </div>
  );
}

export function UniversalNode({
  id,
  data,
}: {
  id: string;
  data: { title: string; content: string, autoPrompts: any};
}) {
  const [dragging, setDragging] = useState(false);
  const [resized, setResized] = useState(false);
  const { setFollowUpModal, onDeleteNode } = useStore(selector, shallow);
  return (
    <>
      <div
        className={`group relative border border-2 border-black bg-white
              text-black rounded-xl flex flex-col ${!resized && "w-[750px] h-[750px]"} ${resized && "w-full h-full"}`}
      >
        <NodeResizeControl
          minWidth={100}
          minHeight={100}
          onResizeStart={() => setDragging(true)}
          onResizeEnd={() => setDragging(false)}
          onResize={() => setResized(true)}
          className="group-hover:opacity-100 opacity-0 bg-transparent border-none transition-opacity duration-200 w-0 h-0 border-none"
        >
          <ResizeIcon />
        </NodeResizeControl>
        <h2 className="font-bold text-lg border-b-2 border-black p-4">
          {data.title}
        </h2>
        <div className="prose py-4 px-6 text-left flex-1 overflow-auto max-w-full">
          <ReactMarkdown>{data.content}</ReactMarkdown>
        </div>
        <button
          className={`absolute top-3 right-3
                      h-5 w-5 p-1 text-zinc-800 hover:bg-gray-200 rounded-full focus:outline-none
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        dragging && "hidden"
                      }`}
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this block?")) {
              onDeleteNode(id);
            }
          }}
        >
          <TrashIcon />
        </button>
        <button
          className={`absolute left-1/2 transform -translate-x-1/2 translate-y-1/2
                        border border-1 ${data.autoPrompts && "bottom-0  hover:scale-125 transform border-black"}
                        ${!data.autoPrompts && "-bottom-6 animate-bounce border-gray-400"}
                             h-10 w-10 p-2 text-zinc-800 bg-white rounded-full focus:outline-none
                             opacity-0 group-hover:opacity-100 transition duration-200 ease-in-out ${dragging && "hidden"}`}
          onClick={() =>
            {
            amplitude.track("follow-up-started")
            setFollowUpModal({
              shown: true,
              sourceId: id,
              sourceHandle: "bottom",
            })
            }
          }
          disabled={!data.autoPrompts}
        >
          <PlusIcon className={`${!data.autoPrompts && "text-gray-400"}`}/>
        </button>

        <Handle
          type="source"
          id="top"
          position={Position.Top}
          className="-m-1 w-4 h-4 p-2 opacity-0 group-hover:opacity-100 text-white transition-opacity duration-200"
        >
          <LinkIcon className="-m-1" />
        </Handle>
      </div>
    </>
  );
}

export function SummaryNode({
  id,
  data,
}: {
  id: string;
  data: { title: string; content: string };
}) {
  const topHandleId = `${id}-t`;

  const controlStyle = {
    background: "transparent",
    border: "none",
  };
  const content = data.content;
  return (
    <div className="relative">
      <div className="h-full w-[400px] border border-2 border-black bg-white text-black rounded-xl">
        <h2 className="font-bold text-lg border-b-2 border-black p-4">
          {data.title}
        </h2>
        <div className="prose p-4 text-left max-w-max">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
      <Handle type="target" position={Position.Top} id={topHandleId} />
    </div>
  );
}

export function TopicNode({
  id,
  data,
}: {
  id: string;
  data: { title: string; content: string; addNode: (node: any) => void };
}) {
  const topHandleId = `${id}-t`;
  const divergeHandleId = `${id}-b-l`;
  const convergeHandleId = `${id}-b-m`;
  const customHandleId = `${id}-b-r`;
  const [divergeStatus, setDivergeStatus] = useState("ready");
  const [convergeStatus, setConvergeStatus] = useState("ready");

  const onDivergeClicked = useCallback(() => {
    setDivergeStatus("loading");
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/diverge?topic=${data.title} ${data.content}`
        );
        const subtopicData = await response.json();
        console.log(subtopicData.choices[0].message.content);
        const subtopicResponse = subtopicData.choices[0].message.content;
        const subtopics = JSON.parse(subtopicResponse).subtopics;
        subtopics.forEach(
          (item: { topic: string; description: string }, index: number) => {
            data.addNode({
              addNode: data.addNode,
              type: "topicNode",
              sourceId: id,
              xOffset: 400 * (index - Math.floor(subtopics.length / 2)),
              yOffset: 50,
              handle: `l`,
              title: item.topic,
              content: item.description,
            });
          }
        );

        setDivergeStatus("done");
      } catch (error) {
        console.error("Error fetching data:", error);
        setDivergeStatus("ready");
      }
    }
    fetchData();
  }, [data, id]);
  const onConvergeClicked = useCallback(() => {
    setConvergeStatus("loading");
    console.log(data);
    async function fetchData(topic: string) {
      try {
        const response = await fetch(`/api/converge?topic=${data.content}`);
        const summaryData = await response.json();
        console.log(summaryData.choices[0].message.content);
        const summaryResponse = summaryData.choices[0].message.content;
        data.addNode({
          addNode: data.addNode,
          sourceId: id,
          type: "summaryNode",
          xOffset: 0,
          yOffset: 30,
          handle: `m`,
          title: data.title,
          content: summaryResponse,
        });
        setConvergeStatus("done");
      } catch (error) {
        console.error("Error fetching data:", error);
        setConvergeStatus("ready");
      }
    }
    fetchData(data.title);
  }, [data, id]);
  const onCustomClicked = useCallback(() => {
    data.addNode({
      addNode: data.addNode,
      sourceId: id,
      xOffset: 850,
      yOffset: -300,
      handle: `r`,
    });
  }, [data, id]);

  const controlStyle = {
    background: "transparent",
    border: "none",
  };

  const content = data.content;
  return (
    <div className="relative">
      <div className="h-full w-[400px] border border-2 border-black bg-white text-black rounded-xl">
        <h2 className="font-bold text-lg border-b-2 border-black p-4">
          {data.title}
        </h2>
        <div className="prose p-4 text-left max-w-max">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div className="flex flex-row">
          <button
            className="basis-1/3 p-4 border-t-2 border-r-2 border-black enabled:hover:bg-gray-100 rounded-bl-xl"
            disabled={divergeStatus !== "ready"}
            onClick={onDivergeClicked}
          >
            {divergeStatus === "loading" ? (
              <span> Loading...</span>
            ) : (
              <span> Explore Subtopics </span>
            )}
          </button>
          <button
            className="basis-1/3 p-4 border-t-2 border-r-2 border-black enabled:hover:bg-gray-100"
            disabled={convergeStatus !== "ready"}
            onClick={onConvergeClicked}
          >
            {convergeStatus === "loading" ? (
              <span> Loading...</span>
            ) : (
              <span> Key Takeaways </span>
            )}
          </button>
          <button
            className="basis-1/3 p-4 border-t-2 border-black enabled:hover:bg-gray-100 disabled:text-gray-500 rounded-br-xl"
            disabled
            onClick={onCustomClicked}
          >
            Custom
          </button>
        </div>
      </div>
      <Handle type="target" position={Position.Top} id={topHandleId} />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: 60 }}
        id={divergeHandleId}
      />
      <Handle type="source" position={Position.Bottom} id={convergeHandleId} />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ right: 60, left: "auto" }}
        id={customHandleId}
      />
    </div>
  );
}
