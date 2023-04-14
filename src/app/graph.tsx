import dynamic from "next/dynamic";
import React, {useRef, useEffect, useState, useCallback, useMemo} from 'react';
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

function Node({ data }) {
  const handleButtonClick = () => {
    console.log("button clicked");
  };

  return (
      <div>
          <div className="h-fit-content border border-2 border-black bg-white text-black rounded-md">
            <h2 className="border-b-2 border-black p-4">Start Here</h2>
              <button className="border-black border-1 border" onClick={handleButtonClick}>Click Me!</button>
          </div>
          <Handle
              type="source"
              position={Position.Bottom}
              id="a"
          />
      </div>
  );
}

function Flow(){

    const reactFlowInstance = useReactFlow();
    useEffect(() => {
        const timeout = setTimeout(() => {
      reactFlowInstance.fitView();
    }, 0);

        return () => clearTimeout(timeout);
    }, [reactFlowInstance]);

    const nodeTypes = useMemo(() => ({ textUpdater: Node}), []);


    const initialNodes = [
        { id: '1', type: 'textUpdater' ,position: { x: 0, y: 0 }, data: { label: '1' } },
        { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
    ];
    const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return <ReactFlow
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

}

function Graph(){

    return <div className="h-screen w-screen">
        <ReactFlowProvider>
            <Flow/>
        </ReactFlowProvider>
    </div>
}

export default Graph;
