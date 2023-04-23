const { Configuration, OpenAIApi } = require("openai");
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const initialPrompt = `Write a short summary about ${topic}, it should be 100-200 words.
Then list out essential subtopics that can help fully understand the topic, all subtopics need a short description
result should be in json format, inclusing the following items:
topic: ${topic}
summary: summary of the topic
subtopics: [{topic: subtopic, description: short description}]
reply in the same language of ${topic}`

    const topicSummaryResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: initialPrompt}],
    });

    return NextResponse.json(topicSummaryResponse.data)
}
