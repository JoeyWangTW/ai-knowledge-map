import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

export async function POST(req: Request) {
  const { prompt,context, markdownMode, language} = (await req.json()) as {
    prompt?: string;
    markdownMode?: boolean;
    context?: Array<{ user: string; assistant: string }>;
    language?: string;
  };

  const initPrompt = `Write a high level overview of ${prompt}, and give 5 most important subtopic and their high level overview,
write in this format
{"summary": <high level overview>,
                        "subtopic": [{"subtopic": <subtopic>,
"content": <subtopic high level overview>}, ...]}`
    const system = `format response in JSON, take any text in "" and use it as keyword.
Content can be markdown, markwond title start from h2. Content must be in ${language}`


  const messages = context
    ? [
        ...context.map((entry) => [
          { role: "user" || "user", content: entry.user },
          { role: "assistant" || "user", content: entry.assistant },
        ]),
        { role: "user" || "user", content: initPrompt || "" },
        ...(markdownMode ? [{ role: "system", content: "format reponse in json" }] : []),
      ].flat()
    : [{ role: "user" || "", content: initPrompt || "" }];

  console.log(messages)
  const payload = {
    model: "gpt-3.5-turbo",
    messages: messages,
    stream: true,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
