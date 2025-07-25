import { Inngest } from "inngest";
import { otelMiddleware } from "inngest/experimental";

export const inngest = new Inngest({
  id: "inngest-next-another-pickle",
  middleware: [otelMiddleware()],
});
