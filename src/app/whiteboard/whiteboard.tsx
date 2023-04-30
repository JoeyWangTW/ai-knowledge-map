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
  NodeResizeControl,
  Position,
  useNodesInitialized,
} from "reactflow";
import useStore from "./store";
import { shallow } from "zustand/shallow";
import "reactflow/dist/style.css";

const selector = (state) => ({
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
  return (
    <ReactFlow nodes={nodes} edges={edges} fitView>
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
