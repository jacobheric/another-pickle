// @ts-nocheck

let requestCounter = 0;

Deno.serve((req) => {
  requestCounter++;
  const currentRequestNumber = requestCounter;

  const url = new URL(req.url);
  const duration = parseInt(url.searchParams.get("duration")) || 30000; // 30 seconds default
  const interval = parseInt(url.searchParams.get("interval")) || 1000; // 1 second default

  console.log(
    `[${currentRequestNumber}] Starting stream for ${duration}ms, sending data every ${interval}ms`
  );

  let timer: number;
  const body = new ReadableStream({
    start(controller) {
      let chunkCount = 0;
      const startTime = Date.now();

      timer = setInterval(() => {
        chunkCount++;
        const elapsed = Date.now() - startTime;

        const chunk =
          JSON.stringify({
            requestNumber: currentRequestNumber,
            chunkNumber: chunkCount,
            elapsedMs: elapsed,
            timestamp: new Date().toISOString(),
            message: `Streaming data chunk ${chunkCount}`,
          }) + "\n";

        controller.enqueue(chunk);
        console.log(
          `[${currentRequestNumber}] Sent chunk ${chunkCount} (${elapsed}ms elapsed)`
        );

        if (elapsed >= duration) {
          clearInterval(timer);

          const finalChunk =
            JSON.stringify({
              requestNumber: currentRequestNumber,
              final: true,
              totalChunks: chunkCount,
              totalDuration: elapsed,
              message: "Stream complete",
            }) + "\n";

          controller.enqueue(finalChunk);
          controller.close();

          console.log(
            `[${currentRequestNumber}] Stream completed after ${elapsed}ms, sent ${
              chunkCount + 1
            } chunks`
          );
        }
      }, interval);
    },
    cancel() {
      clearInterval(timer);
      console.log(
        `[${currentRequestNumber}] Client disconnected, stopping stream`
      );
    },
  });
  return new Response(body.pipeThrough(new TextEncoderStream()), {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
});

console.log(`Server running on http://localhost:8000`);
console.log("Usage: GET /?duration=10000&interval=500");
console.log("  duration: total streaming time in ms (default: 30000)");
console.log("  interval: time between chunks in ms (default: 1000)");
