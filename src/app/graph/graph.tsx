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
import {TopicNode, SummaryNode} from './node'
import { initialize } from "next/dist/server/lib/render-server.js";

let id = 1
const getId = () => `${id++}`
const maxZoom = 10

function Flow(){

    const nodesInitialized = useNodesInitialized();
    const searchParams = useSearchParams()
    const reactFlowInstance = useReactFlow();
    const [initialized, setInitialized] = useState(false)
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => ({ topicNode: TopicNode,
                                       summaryNode: SummaryNode}), []);

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
                        data: {title: props.title,
                               content: props.content,
                               addNode: addNode}})});
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
        const initialResponse = JSON.parse(data.choices[0].message.content);
        console.log(initialResponse)
        const initialNodes = [{ id: "node-0" ,
                    type: 'topicNode',
                    position: {x: 0, y: 0},
                    data: {addNode: addNode,
                           title: initialResponse.topic,
                           content: initialResponse.summary}}];
        const initialEdges = []
        initialResponse.subtopics.forEach((item, index) => {
          const id = getId()
          initialNodes.push({ id: `node-${id}` ,
                    type: 'topicNode',
                              position: {x: 400 * (index - Math.floor(initialResponse.subtopics.length/2)),
                               y: 700},
                    data: {addNode: addNode,
                           title: item.topic,
                           content: item.description}})
          initialEdges.push({id: `edge-${id - 1}`,
                             source: `node-0`,
                             target: `node-${id}`,
                             targetHandle: `node-${id}-t`,
                             sourceHandle:`node-0-b-l`})
        });
        setNodes(initialNodes)
        setEdges(initialEdges)
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
      minZoom={0.1}
      panOnScroll
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
