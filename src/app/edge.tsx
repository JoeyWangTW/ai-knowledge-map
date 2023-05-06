import React from "react";
import {
  getBezierPath,
  Position,
  MarkerType,
  EdgeTypes,
  EdgeProps,
} from "reactflow";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useStore, { RFState } from "./whiteboard/store";
import { shallow } from "zustand/shallow";
import { getEdgeParams } from "./utils/utils";

const selector = (state: RFState) => ({
  onDeleteEdge: state.onDeleteEdge,
  nodes: state.nodes,
});
const foreignObjectSize = 40;

export function CustomEdge({ id, source, target, markerEnd }: EdgeProps) {
  const { onDeleteEdge, nodes } = useStore(selector, shallow);
  const sourceNode = nodes.find((item) => item.id === source);
  const targetNode = nodes.find((item) => item.id === target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });
  const onEdgeClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    onDeleteEdge(id);
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        className="group"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="hidden group-hover:inline">
          <button
            className="rounded-full w-10 h-10 p-2 bg-white text-black"
            onClick={(event) => onEdgeClick(event, id)}
          >
            <XMarkIcon />
          </button>
        </div>
      </foreignObject>
    </>
  );
}
