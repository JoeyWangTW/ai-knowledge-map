import { OpenAIComplete } from "../../utils/OpenAIStream";
import { NextResponse } from 'next/server';

export const config = {
  runtime: "edge",
};

export async function POST(req: Request) {
  const {context} = (await req.json()) as {
    context?: Array<{ user: string; assistant: string }>;
  };

    const prompt = `base on the above, give me 5 more useful follow up questions that I can ask a Large language model to learn more about this topic.`

  const messages = context
    ? [
        ...context.map((entry) => [
          { role: "user" || "user", content: entry.user },
          { role: "assistant" || "user", content: entry.assistant },
        ]),
        { role: "user" || "user", content: prompt || "" },
        { role: "system" || "", content: `response format must be in pure JSON with key "prompts" and an array of strings`},
      ].flat()
    : [{ role: "user" || "", content: prompt || "" }];

  const payload = {
    model: "gpt-3.5-turbo",
    messages: messages,
    stream: false
  };

  const complete = await OpenAIComplete(payload);
    const autoPrompts = complete.choices[0].message.content
    return NextResponse.json(autoPrompts)
}
