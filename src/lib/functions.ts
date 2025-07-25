import { openai } from "inngest";
import { inngest } from "./inngest";

export const anotherPickle = inngest.createFunction(
  {
    id: "another-pickle",
    throttle: {
      limit: 1,
      period: "5s",
      burst: 2,
      key: "event.data.user_id",
    },
  },
  { event: "pickle/another" },
  async ({ event, step }) => {
    console.log("getting first pickle");
    const response = await step.ai.infer("pickleOne", {
      model: openai({
        apiKey: process.env.OPENAI_API_KEY,
        model: "chatgpt-4o-latest",
      }),
      body: {
        temperature: 0.9,
        messages: [
          {
            role: "user",
            content: "Give me a picke recipe.",
          },
        ],
      },
    });

    await step.sleep("wait-a-moment", "6m");

    const responseTwo = await step.ai.infer("pickleTwo", {
      model: openai({
        apiKey: process.env.OPENAI_API_KEY,
        model: "chatgpt-4o-latest",
      }),
      body: {
        temperature: 0.9,
        messages: [
          {
            role: "user",
            content: "Give me another picker recipe.",
          },
        ],
      },
    });

    console.log("another pickle response", response);
    return { event, body: responseTwo };
  }
);

export const timeoutFunction = inngest.createFunction(
  {
    id: "timeout-function",
  },
  { event: "infinite-loop" },
  async ({ step }) => {
    await step.sleep("wait-1s", "1s");

    const url =
      "https://04e6fe6a3709.ngrok-free.app/?duration=850000&interval=5000";

    const response = await fetch(url);
    if (response.body) {
      const reader = response.body.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Process chunk
          console.log(new TextDecoder().decode(value));
        }
      } finally {
        reader.releaseLock();
      }
    }

    await step.sleep("wait-5s", "5s");

    return "done";
  }
);
