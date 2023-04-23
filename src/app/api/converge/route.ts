const { Configuration, OpenAIApi } = require("openai");
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const Prompt = `Give me and overview and some key takeaways of the ${topic}.
Write it in markdown, use only h2 title and bellow, Use bullet points if needed.
reply in the same language of ${topic}`
    const topicOverviewResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: Prompt}],
    });

    return NextResponse.json(topicOverviewResponse.data)
}
