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

const selector = (state: RFState) => ({
  onDeleteEdge: state.onDeleteEdge,
});
const foreignObjectSize = 40;

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const { onDeleteEdge } = useStore(selector, shallow);
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
