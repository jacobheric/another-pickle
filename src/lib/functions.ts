import { openai } from "inngest";
import { inngest } from "./inngest";

export const anotherPickle = inngest.createFunction(
  { id: "another-pickle" },
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
