import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

type Message = {
  role: string;
  content: string;
};

// Define a type for payload
type Payload = {
  model: string;
  messages: Message[];
  stream: boolean;
};

export async function OpenAIStream(payload:Payload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  /*
    const openai = new OpenAIApi(configuration);

    const topicOverviewResponse = await openai.createChatCompletion({
        model: payload.model,
      stream: payload.stream,
        messages: [{role: "user", content: payload.prompt}],
    });
  */

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            if (text){

            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
            }
          } catch (e) {
            controller.error(e);
          }
        }
      }

     // stream response (SSE) from OpenAI may be fragmented into multiple chunks
     // this ensures we properly read chunks & invoke an event for each SSE event stream
     const parser = createParser(onParse);

      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}

export async function OpenAIComplete(payload:Payload) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    body: JSON.stringify(payload),
  };

  const response = await fetch(url, options);

  // Check if request was successful
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
