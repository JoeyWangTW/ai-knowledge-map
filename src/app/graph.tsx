import dynamic from "next/dynamic";
import { relative } from "path";
import React, {useRef, useEffect, useState, useCallback, useMemo} from 'react';
import ReactMarkdown from 'react-markdown'
import ReactFlow, {
    MiniMap,
    Controls,
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
import 'reactflow/dist/style.css';

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

function Node({ id, data}) {

    const topHandleId = `${id}-t`;
    const autoHandleId = `${id}-b-l`;
    const moreHandleId = `${id}-b-m`;
    const customHandleId = `${id}-b-r`;

    const onAutoClicked = useCallback(() => {
        data.addNode({addNode: data.addNode,
                      sourceId: id,
                      xOffset: -850,
                      yOffset: -300,
                      handle: `l`})
    },[data]);
    const onMoreClicked = useCallback(() => {
        data.addNode({addNode: data.addNode,
                      sourceId: id,
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

    const content =
        `
Overview of Generative AI

Generative AI is a subfield of artificial intelligence that focuses on creating new data or content that resembles existing data. This technology has gained popularity due to its applications in art, music, text generation, and more. At the core of generative AI are generative models, which learn patterns and structures within data to create realistic outputs.

### Top Level Learning Syllabus

**Introduction to Generative AI**
- Generative models vs. discriminative models
- Types of generative models: parametric and non-parametric
- Applications of generative AI
        `
        return (
            <div className="relative">
                <NodeResizeControl style={controlStyle}>
                    <ResizeIcon/>
                </NodeResizeControl>
                <div className="h-full border border-2 border-black bg-white text-black rounded-md">
                    <h2 className="border-b-2 border-black p-4">Start Here </h2>
                    <div className="prose p-4 text-left">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                    <div className="flex flex-row">
                        <button className="basis-1/3 p-4 border-t-2 border-r-2 border-black hover:bg-gray-100" onClick={onAutoClicked}>Auto</button>
                        <button className="basis-1/3 p-4 border-t-2 border-r-2 border-black hover:bg-gray-100" onClick={onMoreClicked}>More</button>
                        <button className="basis-1/3 p-4 border-t-2 border-black hover:bg-gray-100" onClick={onCustomClicked}>Custom</button>
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

let id = 1
const getId = () => `${id++}`

function Flow(){

    const reactFlowInstance = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => ({ customNode: Node}), []);

    useEffect(() => {
        const timeout = setTimeout(() => {
      reactFlowInstance.fitView({padding: 1});
        }, 100);

        return () => clearTimeout(timeout);
    }, [reactFlowInstance]);

    const addNode = useCallback((props) => {

        console.warn(nodes, props)
        const id = getId()
        const newNodeId = `node-${id}`;
        const newEdgeId = `edge-${id - 1}`;
        const sourceId = props.sourceId

        setNodes((nds) => {
            const sourceNode = nds.find(node => node.id === sourceId);
            return nds.concat({id: newNodeId,
                        type: 'customNode',
                        position: {x: sourceNode.position.x + props.xOffset,
                                   y: sourceNode.position.y + sourceNode.height + props.yOffset},
                        data: {addNode: props.addNode}})});
        setEdges((eds) => eds.concat({id: newEdgeId,
                                      source: `${sourceId}`,
                                      target: newNodeId,
                                      targetHandle: `node-${id}-t`,
                                      sourceHandle:`${sourceId}-b-${props.handle}`}));
    },[nodes])

    useEffect(() => {
       setNodes([{ id: "node-0" , type: 'customNode', position: {x: 0, y: 0}, data: {addNode: addNode}}])
    },[]);

    //const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return <>
    <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
       edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        //onConnect={onConnect}
        >
        <Controls className="bg-white" />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
    </ReactFlow>
            <button onClick={() => {console.log(nodes, edges)}}>init</button>
            <button onClick={() => {setEdges([{id: "edge-0",
                                               source: "node-0",
                                               target:"node-1",
                                               sourceHandle: "node-0-b",
                                               targetHandle: "node-1-t"}])}}>edge</button>
    </>
}

function Graph(){

    return <div className="h-screen w-screen">
        <ReactFlowProvider>
            <Flow/>
        </ReactFlowProvider>
    </div>
}

export default Graph;
