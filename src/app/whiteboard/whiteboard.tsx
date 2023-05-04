import React, { useMemo, ComponentType} from 'react';
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
  NodeTypes,
  EdgeTypes,
  NodeResizeControl,
  Position,
  useNodesInitialized,
  EdgeProps,
  ConnectionMode,
  Viewport
} from "reactflow";
import useStore, { RFState } from "./store";
import { shallow } from "zustand/shallow";
import "reactflow/dist/style.css";
import { UniversalNode } from "../graph/node";
import {CustomEdge } from "../edge";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    selector,
    shallow
  );

  const nodeTypes: NodeTypes = useMemo(
    () => ({ universalNode: UniversalNode}),
    []
  );

  const edgeTypes: EdgeTypes = useMemo(
    () => ({ customEdge: CustomEdge}),
    []
  );

  const defaultViewport: Viewport = { x: 100, y: 100, zoom: 0.7 }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onConnect={onConnect}
      defaultViewport={defaultViewport}
      panOnScroll
      minZoom={0.1}
      connectionMode={ConnectionMode.Loose}
    >
      <Controls className="bg-white" />
      <MiniMap />
    </ReactFlow>
  );
}

function Whiteboard() {
  return (
    <div className="h-screen w-screen zinc-800">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

export default Whiteboard;
