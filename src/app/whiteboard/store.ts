import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";

type RFState = {
  showModal: boolean;
  onSetShowModal: (showModal: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onUpdateNodeContent: ({
    nodeId,
    content,
  }: {
    nodeId: string;
    content: string;
  }) => void;
};

const generateResponse = async ({
  id,
  prompt,
  onUpdateNodeContent,
}: {
  id: string;
  prompt: string;
  onUpdateNodeContent: ({ nodeId, content }) => void;
}) => {
  const response = await fetch("/api/custom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = response.body;
  if (!data) {
    return;
  }
  const reader = data.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    onUpdateNodeContent({ nodeId: id, content: chunkValue });
  }
};

let id = 1;
const getId = () => `${id++}`;

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  onUpdateNodeContent: ({
    nodeId,
    content,
  }: {
    nodeId: string;
    content: string;
  }) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              content: (node.data.content || "") + content,
            },
          };
        }
        return node;
      });

      return { nodes: updatedNodes };
    });
  },
  onAddNode: ({
    title,
    sourceNodeId,
  }: {
    title: string;
    sourceNodeId: string;
  }) => {
    const newId = getId();
    set(({ nodes }) => {
      const newNode = {
        id: newId,
        type: "universalNode",
        data: { title: title },
        position: { x: 0, y: 0 },
      };

      return { nodes: nodes.concat(newNode) };
    });
    generateResponse({
      id: newId,
      prompt: title,
      onUpdateNodeContent: get().onUpdateNodeContent,
    });
  },
  showModal: true,
  onSetShowModal: (showModal: boolean) => {
    set({ showModal });
  },
}));

export default useStore;
