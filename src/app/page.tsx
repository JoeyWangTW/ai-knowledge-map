'use client';

import React, {FC, useState} from 'react';
import Graph from "./graph"

export default function Home() {
  const [showGraph, setShowGraph] = useState(false);

  const handleButtonClick = () => {
    setShowGraph(true);
  };
  return (
    <main className="font-mono flex items-center justify-center w-full flex-1 text-center">
      {showGraph ?
       <Graph /> :
       <div>
         <h1 className="text-5xl py-6">
           AI Knowledge Map
         </h1>
         <button onClick={handleButtonClick} className="rounded-xl border border-white p-4 hover:border-b-2 hover:border-r-2">
           Get Started
         </button>
       </div>
      }
    </main>
  )
}
