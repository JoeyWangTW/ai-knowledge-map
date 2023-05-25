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
  showInitModal: boolean;
  setFollowUpModal: ({
    shown,
    sourceId,
    sourceHandle,
  }: {
    shown: boolean;
    sourceId: string;
    sourceHandle: string;
  }) => void;
  setShowInitModal: (showInitModal: boolean) => void;
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
  onUpdateNodeAutoPrompts: ({
    nodeId,
    autoPrompts,
  }: {
    nodeId: string;
    autoPrompts: string[];
  }) => void;

  onAddNode: ({
    title,
    markdownMode,
  }: {
    title: string;
    markdownMode: boolean;
  }) => void;
  addInitNodes: ({
    topic,
    breadth,
    depth,
  }: {
    topic: string;
    breadth: number;
    depth: number;
  }) => void;
  onDeleteNode: (id: string) => void;
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
  type,
  prompt,
  onUpdateNodeContent,
  markdownMode,
  context,
}: {
  id: string;
  type: string;
  prompt: string;
  markdownMode: boolean;
  onUpdateNodeContent: ({
    nodeId,
    content,
  }: {
    nodeId: string;
    content: string;
  }) => void;
  context: Array<{ user: string; assistant: string }>;
}) => {
  const response = await fetch(`/api/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      markdownMode,
      prompt,
      context,
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

const generatePrompts = async ({
  context,
  count,
}: {
  context: Array<{ user: string; assistant: string }>;
  count: number;
}) => {
  const response = await fetch("/api/auto-follow-up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      context,
      count,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  if (!data) {
    return;
  }
  return JSON.parse(data).prompts;
};

const nodeSize = 750;

const getPosition = (
  breadth: number,
  layer: number,
  index: number,
  padding: number
) => {
  const nodePerLayer = breadth ** layer;
  console.warn(layer, index, nodePerLayer);
  const angle = (index / nodePerLayer) * 2 * Math.PI;
  const radius = layer * (nodeSize * Math.sqrt(2) + padding);
  const x = radius * Math.cos(angle) - nodeSize / 2;
  const y = radius * Math.sin(angle) - nodeSize / 2;
  return { x, y };
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
  onUpdateNodeAutoPrompts: ({
    nodeId,
    autoPrompts,
  }: {
    nodeId: string;
    autoPrompts: string[];
  }) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              autoPrompts: autoPrompts,
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
    const prompt = title;
    generateResponse({
      id: newId,
      type: "custom",
      prompt: prompt,
      markdownMode: markdownMode,
      onUpdateNodeContent: get().onUpdateNodeContent,
      context: [],
    }).then(() => {
      const sourceNode = get().nodes.find((node) => node.id === newId);

      if (sourceNode) {
        const sourceNodeTitle = sourceNode.data.title;
        const sourceNodeContent = sourceNode.data.content;

        generatePrompts({
          count: 5,
          context: [{ user: sourceNodeTitle, assistant: sourceNodeContent }],
        }).then((autoPrompts) => {
          get().onUpdateNodeAutoPrompts({
            nodeId: newId,
            autoPrompts: autoPrompts,
          });
        });
      }
    });
  },
  addInitNodes: async ({
    topic,
    depth,
    breadth,
  }: {
    topic: string;
    depth: number;
    breadth: number;
  }) => {
    const newId = getId();
    set(({ nodes }) => {
      const newNode = {
        id: newId,
        type: "universalNode",
        data: { title: topic },
        position: { x: 0 - nodeSize / 2, y: 0 - nodeSize / 2 },
      };
      return { nodes: nodes.concat(newNode) };
    });

    const prompt = `Give me a high level overview about ${topic}`;
    await generateResponse({
      id: newId,
      type: "custom",
      prompt: prompt,
      markdownMode: true,
      onUpdateNodeContent: get().onUpdateNodeContent,
      context: [],
    });

    const initNode = get().nodes.find((node) => node.id === newId);

    if (initNode) {
      const initNodeTitle = prompt;
      const initNodeContent = initNode.data.content;

      const autoPrompts = await generatePrompts({
        count: breadth,
        context: [{ user: initNodeTitle, assistant: initNodeContent }],
      });
      get().onUpdateNodeAutoPrompts({
        nodeId: newId,
        autoPrompts: autoPrompts,
      });
    }

    let prevLayerNodes = [{ id: newId, position: { x: 0, y: 0 } }];
    let newLayerNodes: { id: string; position: { x: number; y: number } }[] =
      [];

    for (let layer = 1; layer <= depth; layer++) {
      for (let idx = 0; idx < prevLayerNodes.length; idx++) {
        const node = prevLayerNodes[idx];
        const sourceNodeId = node.id;
        const sourceNode = get().nodes.find((node) => node.id === sourceNodeId);

        for (let i = 0; i < breadth; i++) {
          const position = getPosition(breadth, layer, i + idx * breadth, 100);

          const prompt = sourceNode
            ? sourceNode.data.autoPrompts[i]
            : `tell me more about ${topic}`;
          const newId = getId();

          set(({ nodes, edges }) => {
            const newNode = {
              id: newId,
              type: "universalNode",
              data: { title: prompt },
              position: position,
            };
            newLayerNodes.push(newNode);

            const newEdge = {
              id: `e-${sourceNodeId}-${newId}`,
              source: sourceNodeId,
              target: newId,
              type: "customEdge",
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            };

            return {
              nodes: nodes.concat(newNode),
              edges: edges.concat(newEdge),
            };
          });

          await generateResponse({
            id: newId,
            type: "custom",
            prompt: prompt,
            markdownMode: true,
            onUpdateNodeContent: get().onUpdateNodeContent,
            context: [],
          });

          const childNode = get().nodes.find((node) => node.id === newId);

          if (childNode) {
            const childNodeTitle = prompt;
            const childNodeContent = childNode.data.content;

            const autoPrompts = await generatePrompts({
              count: breadth,
              context: [{ user: childNodeTitle, assistant: childNodeContent }],
            });
            get().onUpdateNodeAutoPrompts({
              nodeId: newId,
              autoPrompts: autoPrompts,
            });
          }
        }
      }
      prevLayerNodes = newLayerNodes;
    }
  },
  onDeleteNode: (id: string) => {
    set(({ nodes, edges }) => {
      const updatedNodes = nodes.filter((node) => node.id !== id);
      const updatedEdges = edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      );
      return { nodes: updatedNodes, edges: updatedEdges };
    });
  },
  showModal: false,
  onSetShowModal: (showModal: boolean) => {
    set({ showModal });
  },
  showInitModal: true,
  setShowInitModal: (showInitModal: boolean) => {
    set({ showInitModal });
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
            y: sourceNodePosition.y + sourceNodeHeight + 100,
          };
        case "top":
          return { x: sourceNodePosition.x, y: sourceNodePosition.y - 500 };
        case "left":
          return { x: sourceNodePosition.x - 500, y: sourceNodePosition.y };
        case "right":
          return {
            x: sourceNodePosition.x + sourceNodeWidth + 100,
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
        type: "customEdge",
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };

      return { nodes: nodes.concat(newNode), edges: edges.concat(newEdge) };
    });

    const sourceNodeTitle = sourceNode.data.title;
    const sourceNodeContent = sourceNode.data.content;
    const followUpPrompt = title;
    const prompt = followUpPrompt;

    generateResponse({
      id: newId,
      type: "custom",
      prompt: prompt,
      markdownMode: markdownMode,
      onUpdateNodeContent: get().onUpdateNodeContent,
      context: [{ user: sourceNodeTitle, assistant: sourceNodeContent }],
    }).then(() => {
      const sourceNode = get().nodes.find((node) => node.id === newId);

      if (sourceNode) {
        const sourceNodeTitle = sourceNode.data.title;
        const sourceNodeContent = sourceNode.data.content;

        generatePrompts({
          count: 5,
          context: [{ user: sourceNodeTitle, assistant: sourceNodeContent }],
        }).then((autoPrompts) => {
          get().onUpdateNodeAutoPrompts({
            nodeId: newId,
            autoPrompts: autoPrompts,
          });
        });
      }
    });
  },
}));

export default useStore;
