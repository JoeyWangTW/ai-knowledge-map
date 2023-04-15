import dynamic from "next/dynamic";
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
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';

function Node({ id, data }) {

    const topHandleId = `${id}-t`;
    const bottomHandleId = `${id}-b`;

    const onMoreClicked = useCallback(() => {
        data.addNode({addNode: data.addNode})
    },[data]);
    const content =
        `The "Unterminated string constant" error occurs when a string literal is not properly closed in your JavaScript or TypeScript code. When you paste multiline Markdown text directly into a string, it may cause this error because regular string literals in JavaScript don't support multiline content.`;
        return (
            <div>
                <div className="h-fit-content border border-2 border-black bg-white text-black rounded-md max-w-xl">
                    <h2 className="border-b-2 border-black p-4">Start Here </h2>
                    <div className="border-b-2 border-black p-4 text-left">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                    <div className="flex flex-row">
                        <button className="basis-1/3 p-4 border-r-2 border-black hover:bg-gray-100">Auto</button>
                        <button className="basis-1/3 p-4 border-r-2 border-black hover:bg-gray-100" onClick={onMoreClicked}>More</button>
                        <button className="basis-1/3 p-4 hover:bg-gray-100">Custom</button>
                    </div>
                </div>
                <Handle
                    type="sorce"
                    position={Position.Top}
                    id= {topHandleId}
                />
                <Handle
                    type="sorce"
                    position={Position.Bottom}
                    id= {bottomHandleId}
                />
            </div>
        )
}

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
        const nodeId = `node-${nodes.length - 1}`
        const newNodeId = `node-${nodes.length}`;
        const newEdgeId = `edge-${edges.length}`;
        console.warn(nodes,nodeId, newNodeId, newEdgeId)
        setNodes((nds) => nds.concat({id: newNodeId,
                                      type: 'customNode',
                                      position: {x: 0, y: 0},
                                      data: {addNode: props.addNode}}));
        //setEdges((eds) => eds.concat({newEdgeId,
        //                              source: nodeId,
        //                              target: newNodeId,
        //                              targetHandle: `${newNodeId}-t`,
         //                             sourceHandle:`${nodeId}-b`}));
    }, [nodes])

   const onInit = () => {
       setNodes([{ id: "node-0" , type: 'customNode', position: {x: 0, y: 0}, data: {addNode: addNode}}])
   };

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return <>
    <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
       edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}>
        <Controls className="bg-white" />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
    </ReactFlow>
            <button onClick={onInit}>init</button>
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
