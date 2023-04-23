const { Configuration, OpenAIApi } = require("openai");
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const Prompt = `${topic}
list out essential subtopics that can help fully understand the topic above, all subtopics need a short description
result should be in json format

subtopics: [{topic: subtopic 1, description: short description of the topic},
{topic: subtopic 2, description: short description of the topic}]`

    const topicOverviewResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: Prompt}],
    });

    return NextResponse.json(topicOverviewResponse.data)
}
