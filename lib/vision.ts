import OpenAI from "openai";

export const VISION_MODEL =
  process.env.VISION_MODEL ?? "Qwen/Qwen3.6-35B-A3B-FP8";
export const VISION_BASE_URL =
  process.env.OPENAI_BASE_URL ?? "https://inference.hetzner.com/api/v1";

export function visionClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ baseURL: VISION_BASE_URL, apiKey, timeout: 60_000 });
}

export type BountyVerdict = {
  pass: boolean;
  reason: string;
};

const SYSTEM = `You are a strict bounty oracle for a proof-of-action protocol.
Given a task description and one photo, decide if the photo proves the task was done.
Reply with ONLY valid JSON: {"pass": true|false, "reason": "<max 20 words>"}.
Be skeptical of screenshots, stock photos, or unrelated scenes. When in doubt, pass=false.`;

// Simple per-instance throttle: Hetzner allows 10 req/60s per key.
let windowStart = 0;
let windowCount = 0;

export function checkVisionBudget(): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= 9) {
    return { ok: false, retryAfterSec: Math.ceil((60_000 - (now - windowStart)) / 1000) };
  }
  windowCount += 1;
  return { ok: true, retryAfterSec: 0 };
}

function extractJson(text: string): BountyVerdict | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const obj = JSON.parse(text.slice(start, end + 1)) as {
      pass?: unknown;
      reason?: unknown;
    };
    return {
      pass: obj.pass === true,
      reason: typeof obj.reason === "string" ? obj.reason.slice(0, 140) : "no reason",
    };
  } catch {
    return null;
  }
}

export async function verifyBountyPhoto(
  task: string,
  imageUrl: string
): Promise<BountyVerdict> {
  const client = visionClient();
  const res = await client.chat.completions.create({
    model: VISION_MODEL,
    max_tokens: 200,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: `Task: ${task}` },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim() ?? "";
  return (
    extractJson(text) ?? {
      pass: false,
      reason: "unparseable oracle reply",
    }
  );
}
