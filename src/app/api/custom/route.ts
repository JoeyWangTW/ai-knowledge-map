import { OpenAIStream } from "../../utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

export async function POST(req: Request) {
  const { prompt } = (await req.json()) as {
    prompt?: string;
  };

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user" as "user" | "assistant", content: prompt || "" }],
    stream: true,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
