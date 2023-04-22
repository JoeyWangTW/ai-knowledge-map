import { relative } from "path";
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
  NodeResizeControl,
  Position,
  useNodesInitialized
} from 'reactflow';
import { useSearchParams } from 'next/navigation';
import 'reactflow/dist/style.css';
import TopicNode from './node.tsx'
import { initialize } from "next/dist/server/lib/render-server.js";

let id = 1
const getId = () => `${id++}`

function Flow(){

    const nodesInitialized = useNodesInitialized();
    const searchParams = useSearchParams()
    const reactFlowInstance = useReactFlow();
    const [initialized, setInitialized] = useState(false)
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => ({ topicNode: TopicNode}), []);

    useEffect(() => {

      if(nodesInitialized){
          reactFlowInstance.fitView({padding: 0.5});
          setInitialized(true)
        };
    }, [reactFlowInstance, nodesInitialized]);

    const addNode = useCallback((props) => {

        const id = getId()
        const newNodeId = `node-${id}`;
        const newEdgeId = `edge-${id - 1}`;
        const sourceId = props.sourceId

        setNodes((nds) => {
            const sourceNode = nds.find(node => node.id === sourceId);
            return nds.concat({id: newNodeId,
                        type: props.type,
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
      const topic = searchParams.get('topic')

      async function fetchData(topic) {
      try {
        const response = await fetch(`/api/initialize-graph?topic=${topic}`);
        const data = await response.json();
        const content = data.choices[0].message.content;
      setNodes([{ id: "node-0" ,
                  type: 'topicNode',
                  position: {x: 0, y: 0},
                  data: {addNode:addNode,
                         title: topic,
                         content: content}}])
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      }

      fetchData(topic);

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
    </ReactFlow>
    {!initialized && (
      <div className="absolute h-screen w-screen top-0 z-10 bg-zinc-800 flex justify-center items-center">
        <div className="w-5 h-5 object-center animate-spin bg-white"></div>
      </div>
    )}
  </>
}

function Graph(){
    return <div className="h-screen w-screen bg-zinc-800">
        <ReactFlowProvider>
            <Flow/>
        </ReactFlowProvider>
    </div>
}

export default Graph;
