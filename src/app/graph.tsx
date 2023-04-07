'use client'

import dynamic from "next/dynamic";
import React, {useRef, useEffect, useState} from 'react';

function Graph(){
    const ForceGraph2D = dynamic(() => import('react-force-graph').then((r) => r.ForceGraph2D), { ssr: false });
    let data = {
            nodes: [{ id: "0x0000001", balance: 10, index: 0},
                    { id: "0x0000002", balance: 1, index: 1},
                    { id: "0x0000003", balance: 3, index: 2},
                    { id: "0x0000004", balance: 6, index: 3}
            ],
      links: [
        { source: "0x0000001", target: "0x0000002", value: 2},
        { source: "0x0000002", target: "0x0000001", value: 3},
        { source: "0x0000002", target: "0x0000003", value: 8 },
        { source: "0x0000004", target: "0x0000003", value: 10 },
        { source: "0x0000001", target: "0x0000003", value: 6 },
        { source: "0x0000004", target: "0x0000001", value: 6 },
      ]
    };

    return <div className="w-full h-full">
        <ForceGraph2D
            graphData={data}
        />
    </div>
}

export default Graph;
