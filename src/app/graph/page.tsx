'use client';

import React, {useState} from 'react';
import Graph from "./graph"
import { Analytics } from '@vercel/analytics/react';

export default function Home() {
  return (
    <main className="font-sans flex items-center justify-center w-screen h-screen flex-1 text-center">
        <Analytics/>
        <Graph />
    </main>
  )
}
