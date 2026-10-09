export interface SseResult {
  content: string;
  reasoning: string;
}

/**
 * Read an OpenAI-style SSE stream (NVIDIA NIM chat completions).
 * Network chunks can end in the middle of a line or a multi-byte character,
 * so text is buffered and only complete lines are parsed.
 */
export async function readSseStream(
  body: ReadableStream<Uint8Array>,
): Promise<SseResult> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const result: SseResult = { content: "", reasoning: "" };
  let buffer = "";

  const handleLine = (rawLine: string) => {
    const line = rawLine.trim();
    if (!line.startsWith("data:")) return;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return;
    try {
      const delta = JSON.parse(data)?.choices?.[0]?.delta;
      if (typeof delta?.content === "string") result.content += delta.content;
      if (typeof delta?.reasoning_content === "string") {
        result.reasoning += delta.reasoning_content;
      }
    } catch {
      console.warn("Skipping malformed SSE data line");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) handleLine(line);
  }

  // Flush any bytes the decoder is still holding, then the last partial line.
  buffer += decoder.decode();
  for (const line of buffer.split("\n")) handleLine(line);

  return result;
}