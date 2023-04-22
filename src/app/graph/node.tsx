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

export function SummaryNode({id, data}) {
     const topHandleId = `${id}-t`;

    const controlStyle = {
        background: 'transparent',
        border: 'none',
    };
   const content = data.content
   return (
       <div className="relative">
           <NodeResizeControl style={controlStyle}>
               <ResizeIcon/>
           </NodeResizeControl>
           <div className="h-full border border-2 border-black bg-white text-black rounded-xl">
               <h2 className="border-b-2 border-black p-4">{data.title}</h2>
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

export function TopicNode({id, data}) {

    const topHandleId = `${id}-t`;
    const autoHandleId = `${id}-b-l`;
    const moreHandleId = `${id}-b-m`;
    const customHandleId = `${id}-b-r`;

    const onDivergeClicked = useCallback(() => {
        data.addNode({addNode: data.addNode,
                      type: 'topicNode',
                      sourceId: id,
                      xOffset: -850,
                      yOffset: -300,
                      handle: `l`})
    },[data]);
    const onConvergeClicked = useCallback(() => {
        data.addNode({addNode: data.addNode,
                      sourceId: id,
                      type: 'summaryNode',
                      xOffset: 0,
                      yOffset: 20,
                      handle: `m`})
    },[data]);
    const onCustomClicked = useCallback(() => {
        data.addNode({addNode: data.addNode,
                      sourceId: id,
                      xOffset: 850,
                      yOffset: -300,
                      handle: `r`})
    },[data]);

    const controlStyle = {
        background: 'transparent',
        border: 'none',
    };

    const content = data.content
        return (
            <div className="relative">
                <NodeResizeControl style={controlStyle}>
                    <ResizeIcon/>
                </NodeResizeControl>
                <div className="h-full border border-2 border-black bg-white text-black rounded-xl">
                    <h2 className="border-b-2 border-black p-4">{data.title}</h2>
                    <div className="prose p-4 text-left max-w-max">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                    <div className="flex flex-row">
                        <button className="basis-1/3 p-4 border-t-2 border-r-2 border-black hover:bg-gray-100"
                                onClick={onDivergeClicked}>Explore Subtopics</button>
                        <button className="basis-1/3 p-4 border-t-2 border-r-2 border-black hover:bg-gray-100"
                                onClick={onConvergeClicked}>Key Takeaways</button>
                        <button className="basis-1/3 p-4 border-t-2 border-black enabled:hover:bg-gray-100 disabled:text-gray-500"
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
                    id = {autoHandleId}
                />
                <Handle
                    type = "source"
                    position = {Position.Bottom}
                    id = {moreHandleId}
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
