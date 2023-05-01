import { create } from 'zustand';
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
} from 'reactflow';

type RFState = {
    showModal: boolean;
    onSetShowModal: (showModal: boolean) => void;
    nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
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
    onUpdateNodeContent: (nodeId: string, content: string) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId){
                    node.data = {...node.data, content}
                }
                return node;
            })
        })
    },
    onAddNode: (title: string, sourceNodeId: string) => {
       console.log("addNode")
    },
    showModal: true,
    onSetShowModal: (showModal: boolean) => {
    set({ showModal });
  },
}));

export default useStore;
