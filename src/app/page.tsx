'use client';

import React, {useState} from 'react';
import { useRouter } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';
import va from '@vercel/analytics';

export default function Home() {

    const router = useRouter();
    const [topic, setTopic] = useState('')
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
    };
    const handleTopicSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        va.track("topic_submitted", {topic: `${topic}`})
        router.push(`/graph?topic=${topic}`);
   };

    return (
        <main className="font-mono flex items-center justify-center w-screen h-screen flex-1 text-center">
            <Analytics/>
            <div>
                <h1 className="text-5xl py-6">
                    Enter a Topic to Start Exploring
                </h1>
                <form onSubmit={handleTopicSubmit}>
                    <div>
                        <input className="px-2 w-96 rounded-lg border border-white border-1 mb-4 h-10 text-black"
                               placeholder="Ex: Lean Startup" onChange={handleInputChange}></input>
                    </div>
                    <button type="submit" className="w-96 rounded-xl border border-white p-4 hover:border-b-2 hover:border-r-2">
                        Create Knowledge Map
                    </button>
                </form>
            </div>
        </main>
    )
}
