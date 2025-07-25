import { anotherPickle, timeoutFunction } from "@/lib/functions";
import { inngest } from "@/lib/inngest";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [anotherPickle, timeoutFunction],
  streaming: "force",
});
