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
    // Test: Wait for 6 minutes to see if the function itself can live this long.
    await step.sleep("wait-for-6m", "6m");

    console.log("Slept for 6 minutes, now fetching...");

    // Use a short-lived stream for this test.
    const url =
      "https://b7da049814ce.ngrok-free.app/?duration=10000&interval=1000";

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
        console.log("Fetch test complete.");
      } finally {
        reader.releaseLock();
      }
    }

    return "done";
  }
);
