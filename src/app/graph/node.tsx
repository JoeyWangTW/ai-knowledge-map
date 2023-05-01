import ReactMarkdown from 'react-markdown'
import React, {useRef, useEffect, useState, useCallback, useMemo} from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    ReactFlowProvider,
    useEdgesState,
    addEdge,
    useReactFlow,
    Handle,
    NodeResizeControl,
    Position
} from 'reactflow';
import va from '@vercel/analytics';

import useStore, {RFState} from "../whiteboard/store";
import { shallow } from "zustand/shallow";

const selector = (state: RFState) => ({
    onUpdateNodeContent: state.onUpdateNodeContent
});


function ResizeIcon() {
    return (
        <div className="absolute right-4 bottom-20">
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

export function UniversalNode({ id, data }: { id: string; data: { title: string; content: string }}) {

    return (
        <div className="relative">
            <div className="h-full border border-2 border-black bg-white text-black rounded-xl">
                <h2 className="font-bold text-lg border-b-2 border-black p-4">{data.title}</h2>
                <div className="prose p-4 text-left max-w-max">
                     <ReactMarkdown>{data.content}</ReactMarkdown>
                </div>
            </div>
        </div>
    )
}

export function SummaryNode({ id, data }: { id: string; data: { title: string; content: string }}) {
    const topHandleId = `${id}-t`;

    const controlStyle = {
        background: 'transparent',
        border: 'none',
    };
   const content = data.content
   return (
       <div className="relative">
           <div className="h-full w-[400px] border border-2 border-black bg-white text-black rounded-xl">
               <h2 className="font-bold text-lg border-b-2 border-black p-4">{data.title}</h2>
               <div className="prose p-4 text-left max-w-max">
                   <ReactMarkdown>{content}</ReactMarkdown>
               </div>
           </div>
           <Handle
               type = "target"
               position = {Position.Top}
               id = {topHandleId}
           />
       </div>
   )

}

export function TopicNode({ id, data }:
                          { id: string;
                            data: { title: string;content: string; addNode: (node: any) => void}}) {

    const topHandleId = `${id}-t`;
    const divergeHandleId = `${id}-b-l`;
    const convergeHandleId = `${id}-b-m`;
    const customHandleId = `${id}-b-r`;
    const [divergeStatus, setDivergeStatus] = useState("ready")
    const [convergeStatus, setConvergeStatus] = useState("ready")

    const onDivergeClicked = useCallback(() => {
        setDivergeStatus("loading")
        va.track("topic_diverged")
        async function fetchData() {
             try {
                 const response = await fetch(`/api/diverge?topic=${data.title} ${data.content}`);
                 const subtopicData = await response.json();
                 console.log(subtopicData.choices[0].message.content)
                 const subtopicResponse = subtopicData.choices[0].message.content;
                 const subtopics = JSON.parse(subtopicResponse).subtopics
                 subtopics.forEach((item: {topic: string, description: string},
                                           index: number) => {
                     data.addNode({addNode: data.addNode,
                                  type: 'topicNode',
                                  sourceId: id,
                                  xOffset: 400 * (index - Math.floor(subtopics.length/2)),
                                  yOffset: 50,
                                  handle: `l`,
                                   title: item.topic,
                                   content: item.description})
                 });

                 setDivergeStatus("done")
             } catch (error) {
                 console.error('Error fetching data:', error);
                 setDivergeStatus("ready")
             }
        }
        fetchData()

    },[data, id]);
    const onConvergeClicked = useCallback(() => {
        setConvergeStatus("loading")
        va.track("topic_converged")
        console.log(data)
        async function fetchData(topic: string) {
             try {
                 const response = await fetch(`/api/converge?topic=${data.content}`);
                 const summaryData = await response.json();
                 console.log(summaryData.choices[0].message.content)
                 const summaryResponse = summaryData.choices[0].message.content;
                 data.addNode({addNode: data.addNode,
                               sourceId: id,
                               type: 'summaryNode',
                               xOffset: 0,
                               yOffset: 30,
                               handle: `m`,
                               title: data.title,
                               content: summaryResponse})
                 setConvergeStatus("done")
             } catch (error) {
                 console.error('Error fetching data:', error);
                 setConvergeStatus("ready")
             }
        }
        fetchData(data.title)
    },[data, id]);
    const onCustomClicked = useCallback(() => {
        data.addNode({addNode: data.addNode,
                      sourceId: id,
                      xOffset: 850,
                      yOffset: -300,
                      handle: `r`})
    },[data, id]);

    const controlStyle = {
        background: 'transparent',
        border: 'none',
    };

    const content = data.content
        return (
            <div className="relative">
                <div className="h-full w-[400px] border border-2 border-black bg-white text-black rounded-xl">
                    <h2 className="font-bold text-lg border-b-2 border-black p-4">{data.title}</h2>
                    <div className="prose p-4 text-left max-w-max">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                    <div className="flex flex-row">
                        <button className="basis-1/3 p-4 border-t-2 border-r-2 border-black enabled:hover:bg-gray-100 rounded-bl-xl"
                                disabled={divergeStatus !== "ready"}
                                onClick={onDivergeClicked}>{divergeStatus === "loading" ? (
                                        <span> Loading...</span>) : (
                                            <span> Explore Subtopics </span>
                                    )}</button>
                        <button className="basis-1/3 p-4 border-t-2 border-r-2 border-black enabled:hover:bg-gray-100"
                                disabled={convergeStatus !== "ready"}
                                onClick={onConvergeClicked}>{convergeStatus === "loading" ? (
                                        <span> Loading...</span>) : (
                                            <span> Key Takeaways </span>
                                    )}</button>
                        <button className="basis-1/3 p-4 border-t-2 border-black enabled:hover:bg-gray-100 disabled:text-gray-500 rounded-br-xl"
                                disabled onClick={onCustomClicked}>Custom</button>
                    </div>
                </div>
                <Handle
                    type = "target"
                    position = {Position.Top}
                    id = {topHandleId}
                />
                <Handle
                    type = "source"
                    position = {Position.Bottom}
                    style ={{left:60}}
                    id = {divergeHandleId}
                />
                <Handle
                    type = "source"
                    position = {Position.Bottom}
                    id = {convergeHandleId}
                />
                <Handle
                    type = "source"
                    position = {Position.Bottom}
                    style ={{right:60, left: 'auto'}}
                    id = {customHandleId}
                />
            </div>
        )
}
