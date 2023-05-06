import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";

export type RFState = {
  showModal: boolean;
  followUpModal: { shown: boolean; sourceId: string; sourceHandle: string };
  setFollowUpModal: ({
    shown,
    sourceId,
    sourceHandle,
  }: {
    shown: boolean;
    sourceId: string;
    sourceHandle: string;
  }) => void;
  onSetShowModal: (showModal: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  importNodesAndEdges: (importedNodes: Node[], importedEdges: Edge[]) => void;
  onUpdateNodeContent: ({
    nodeId,
    content,
  }: {
    nodeId: string;
    content: string;
  }) => void;
  onAddNode: ({
    title,
    markdownMode,
  }: {
    title: string;
    markdownMode: boolean;
  }) => void;
  onDeleteEdge: (id: string) => void;
  onAddFollowUpNode: ({
    title,
    sourceId,
    sourceHandle,
    markdownMode,
  }: {
    title: string;
    sourceId: string;
    sourceHandle: string;
    markdownMode: boolean;
  }) => void;
};

const generateResponse = async ({
  id,
  prompt,
  onUpdateNodeContent,
}: {
  id: string;
  prompt: string;
  onUpdateNodeContent: ({
    nodeId,
    content,
  }: {
    nodeId: string;
    content: string;
  }) => void;
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
    // Check if the source and target handles exist in the connection object
    if (!connection.sourceHandle || !connection.targetHandle) {
      return;
    }

    // Add the custom edge to the state (use your state management method here)
    set(({ edges }: RFState) => {
      const customEdge: Edge = {
        ...connection,
        source: connection.source || "",
        target: connection.target || "",
        sourceHandle: connection.sourceHandle || "",
        targetHandle: connection.targetHandle || "",
        id: `${connection.source}->${connection.target}`,
        type: "customEdge",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      return { edges: [...edges, customEdge] };
    });
  },
  importNodesAndEdges: (importedNodes: Node[], importedEdges: Edge[]) => {
    set({ nodes: importedNodes, edges: importedEdges });
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
    markdownMode,
  }: {
    title: string;
    sourceNodeId: string;
    markdownMode: boolean;
  }) => {
    const newId = getId();
    set(({ nodes }) => {
      const lastNode = nodes[nodes.length - 1];
      const newNodeX = lastNode ? lastNode.position.x : 0;
      const newNodeY = lastNode
        ? lastNode.position.y + (lastNode.height ?? 0) + 50
        : 0;
      const newNode = {
        id: newId,
        type: "universalNode",
        data: { title: title },
        position: { x: newNodeX, y: newNodeY },
      };

      return { nodes: nodes.concat(newNode) };
    });
    const prompt = markdownMode ? `${title}\n\nWrite in markdown:` : title;
    generateResponse({
      id: newId,
      prompt: prompt,
      onUpdateNodeContent: get().onUpdateNodeContent,
    });
  },
  showModal: true,
  onSetShowModal: (showModal: boolean) => {
    set({ showModal });
  },
  onDeleteEdge: (id: string) => {
    set((state) => {
      const filteredEdges = state.edges.filter((edge) => edge.id !== id);
      return { edges: filteredEdges };
    });
  },
  followUpModal: { shown: false, sourceId: "", sourceHandle: "" },
  setFollowUpModal: ({
    shown,
    sourceId,
    sourceHandle,
  }: {
    shown: boolean;
    sourceId: string;
    sourceHandle: string;
  }) => {
    set({
      followUpModal: {
        shown: shown,
        sourceId: sourceId,
        sourceHandle: sourceHandle,
      },
    });
  },
  onAddFollowUpNode: ({
    title,
    sourceId,
    sourceHandle,
    markdownMode,
  }: {
    title: string;
    sourceId: string;
    sourceHandle: string;
    markdownMode: boolean;
  }) => {
    const newId = getId();

    const sourceNode = get().nodes.find((node) => node.id === sourceId);

    if (!sourceNode) {
      console.error("Source node not found!");
      return;
    }

    const newPosition = (() => {
      const sourceNodePosition = sourceNode.position;
      const sourceNodeHeight = sourceNode.height ?? 0;
      const sourceNodeWidth = sourceNode.width ?? 0;

      switch (sourceHandle) {
        case "bottom":
          return {
            x: sourceNodePosition.x,
            y: sourceNodePosition.y + sourceNodeHeight + 50,
          };
        case "top":
          return { x: sourceNodePosition.x, y: sourceNodePosition.y - 500 };
        case "left":
          return { x: sourceNodePosition.x - 500, y: sourceNodePosition.y };
        case "right":
          return {
            x: sourceNodePosition.x + sourceNodeWidth + 50,
            y: sourceNodePosition.y,
          };
        default:
          return sourceNodePosition;
      }
    })();

    set(({ nodes, edges }) => {
      const newNode = {
        id: newId,
        type: "universalNode",
        data: { title: title },
        position: newPosition,
      };

      const targetHandle = {
        bottom: "top",
        top: "bottom",
        left: "right",
        right: "left",
      }[sourceHandle];

      const newEdge = {
        id: `e-${sourceId}-${newId}`,
        source: sourceId,
        target: newId,
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
      };

      return { nodes: nodes.concat(newNode), edges: edges.concat(newEdge) };
    });

    const sourceNodeTitle = sourceNode.data.title;
    const sourceNodeContent = sourceNode.data.content;
    const followUpPrompt = `${sourceNodeTitle}\n${sourceNodeContent}\n\n${title}`;
    const prompt = markdownMode
      ? `${followUpPrompt}\n\nWrite in markdown:`
      : followUpPrompt;

    generateResponse({
      id: newId,
      prompt: prompt,
      onUpdateNodeContent: get().onUpdateNodeContent,
    });
  },
}));

export default useStore;
