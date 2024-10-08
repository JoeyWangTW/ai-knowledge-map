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
  NodeTypes,
  NodeResizeControl,
  Position,
  useNodesInitialized
} from 'reactflow';
import { useSearchParams, useRouter } from 'next/navigation';
import 'reactflow/dist/style.css';
import {TopicNode, SummaryNode} from './node'
import { initialize } from "next/dist/server/lib/render-server.js";

let id: number = 1
const getId = () => {
  const currentId = id;
  id++;
  return `${currentId}`;
};
const maxZoom = 10

function Flow(){

  const nodesInitialized = useNodesInitialized();
    const searchParams = useSearchParams()
    const reactFlowInstance = useReactFlow();
    const [pageInitialized, setPageInitialized] = useState(false)
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes: NodeTypes = useMemo(()=>({topicNode: TopicNode,
                                               summaryNode: SummaryNode}), [])
    const router = useRouter();

   useEffect(() => {

      if(nodesInitialized && !pageInitialized){
          reactFlowInstance.fitView({padding: 0.5});
          setPageInitialized(true)
        };
    }, [reactFlowInstance, nodesInitialized, pageInitialized]);

  type AddNodeParams = {
  sourceId: string;
  type: string;
  xOffset: number;
  yOffset: number;
  title: string;
  content: string;
  handle: string;
  };

  const addNode = useCallback(({sourceId, type, xOffset, yOffset, title, content, handle}: AddNodeParams) => {

        const id = getId()
        const newNodeId = `node-${id}`;
        const newEdgeId = `edge-${parseInt(id) - 1}`;

    setNodes((nds) => {
            const sourceNode = nds.find(node => node.id === sourceId);
            if(sourceNode && sourceNode.position && sourceNode.height){
              return nds.concat({id: newNodeId,
                        type: type,
                        position: {x: sourceNode.position.x + xOffset,
                                   y: sourceNode.position.y + sourceNode.height + yOffset},
                        data: {title: title,
                               content: content,
                               addNode: addNode}})}
      else{ return nds }})
        setEdges((eds) => eds.concat({id: newEdgeId,
                                      source: `${sourceId}`,
                                      target: newNodeId,
                                      targetHandle: `node-${id}-t`,
                                      sourceHandle:`${sourceId}-b-${handle}`}));
    },[setNodes, setEdges])

    useEffect(() => {
      const topic = searchParams.get('topic')

      async function fetchData(topic: string) {
      try {
        const response = await fetch(`/api/initialize-graph?topic=${topic}`);
        const data = await response.json();
        const initialResponse = JSON.parse(data.choices[0].message.content);
        console.log(initialResponse)
        const initialNodes = [{ id: "node-0" ,
                    type: 'topicNode',
                    position: {x: 0, y: 0},
                    data: {addNode: addNode,
                           title: initialResponse.topic,
                           content: initialResponse.summary}}];
        const initialEdges: { id: string; source: string; target: string; targetHandle: string; sourceHandle: string }[] = [];
        initialResponse.subtopics.forEach((item: {topic: string, description: string},
                                           index: number) => {
          const id = getId()
          initialNodes.push({ id: `node-${id}` ,
                    type: 'topicNode',
                              position: {x: 400 * (index - Math.floor(initialResponse.subtopics.length/2)),
                               y: 700},
                    data: {addNode: addNode,
                           title: item.topic,
                           content: item.description}})
          initialEdges.push({id: `edge-${parseInt(id) - 1}`,
                             source: `node-0`,
                             target: `node-${id}`,
                             targetHandle: `node-${id}-t`,
                             sourceHandle:`node-0-b-l`})
        });
        setNodes(initialNodes)
        setEdges(initialEdges)
        } catch (error) {
          console.error('Error fetching data:', error);
          alert("Sorry, something went wrong. Please try again.")
          router.push(`/`);
        }
      }
      if (topic){
        fetchData(topic);
      } else {
        console.error("topic missing")
      }

    },[searchParams, setEdges, addNode, setNodes, router]);

  //const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return <>
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={0.1}
      panOnScroll
  //onConnect={onConnect}
  >
  <Controls className="bg-white" />
  <MiniMap />
    </ReactFlow>
    {!pageInitialized && (
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
