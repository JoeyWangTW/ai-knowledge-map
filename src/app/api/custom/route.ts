import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

export async function POST(req: Request) {
  const { prompt,context, markdownMode} = (await req.json()) as {
    prompt?: string;
    markdownMode?: boolean;
    context?: Array<{ user: string; assistant: string }>;
  };

  const messages = context
    ? [
        ...context.map((entry) => [
          { role: "user" as "user" | "assistant" | "system", content: entry.user },
          { role: "assistant" as "user" | "assistant" | "system", content: entry.assistant },
        ]),
        { role: "user" as "user" | "assistant" | "system", content: prompt || "" },
        markdownMode ? { role: "system" as "user" | "assistant" | "system", content: "Markdown" } : null,
      ].flat()
    : [
        { role: "user" as "user" | "assistant", content: prompt || "" },
        markdownMode ? { role: "system" as "user" | "assistant" | "system", content: "Markdown" } : null,
      ].filter((msg) => msg !== null);

  console.log(messages)
  const payload = {
    model: "gpt-3.5-turbo",
    messages: messages,
    stream: true,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
