import { OpenAIComplete } from "../../utils/OpenAIStream";
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export async function POST(req: Request) {
  const { context, count, language } = (await req.json()) as {
    count?: number;
    context?: Array<{ user: string; assistant: string }>;
    language?: string;
  };

  const shape = { prompts: ["question1"] };

  const system = `you are researchGPT, a model designed to help users explore new topics.
Generate questions that are crucial to understanding the subject and also questions that might help reveal unknown aspects of it.
Your response must be one JSON object strictly following this structure: ${JSON.stringify(
    shape
  )}. Respond content needs to be in ${language}.`;
  const prompt = `Generate ${count} useful follow-up questions, that I can ask a Large language model to learn more about this topic.
${system}`;

  //Please format your response as follows: {"prompts": ["Question 1", "Question 2", ..., "Question ${count}"]}.
  console.log(prompt)
  const messages = context
    ? [
        ...context.map((entry) => [
          { role: "user" || "user", content: entry.user },
          { role: "assistant" || "user", content: entry.assistant },
        ]),
        { role: "user" || "user", content: prompt || "" },
      ].flat()
    : [{ role: "user" || "", content: prompt || "" }];

  const payload = {
    model: "gpt-3.5-turbo",
    messages: messages,
    stream: false,
  };

  const complete = await OpenAIComplete(payload);
  const autoPrompts = complete.choices[0].message.content;

  console.log("auto prompts")
  console.log(autoPrompts)
  try {
    JSON.parse(autoPrompts);
    return NextResponse.json(autoPrompts);
  } catch (error) {
    console.error("The AI output was not valid JSON:", error);
    return NextResponse.json(JSON.stringify({ prompts: [] }));
  }
}
