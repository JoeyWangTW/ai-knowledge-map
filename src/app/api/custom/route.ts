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
          { role: "user" || "user", content: entry.user },
          { role: "assistant" || "user", content: entry.assistant },
        ]),
        { role: "user" || "user", content: prompt || "" },
        ...(markdownMode ? [{ role: "system", content: "format response using markdown, title start from h2" }] : []),
      ].flat()
    : [{ role: "user" || "", content: prompt || "" }];

  console.log(messages)
  const payload = {
    model: "gpt-3.5-turbo",
    messages: messages,
    stream: true,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
