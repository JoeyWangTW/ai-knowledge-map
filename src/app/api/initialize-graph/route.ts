const { Configuration, OpenAIApi } = require("openai");
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const initialPrompt = `Write a short summary about ${topic}, write it in 100 words`

    const topicSummaryResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: initialPrompt}],
    });

    return NextResponse.json(topicSummaryResponse.data)
}
