import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate input
    const { prompt, studentCode, stdout, stderr } = await req.json();
    if (!prompt || typeof studentCode !== "string") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Guard against missing key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set on server" },
        { status: 500 }
      );
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system:
        "You are a patient, encouraging programming tutor for beginners. make sure the explanations can be understood by someone without any programming knowledge" +
        "When reviewing student code: (1) note what they did well, " +
        "(2) identify one concrete issue if any, (3) give a hint, walk through how to solve the issue step by step. " +
        "Keep responses under 120 words. Use plain English, no jargon.",
      messages: [
        {
          role: "user",
          content:
`Problem: ${prompt}

Student's code:
\`\`\`python
${studentCode}
\`\`\`

Program output:
${stdout || "(no output)"}
${stderr ? `\nErrors:\n${stderr}` : ""}

Please give feedback.`,
        },
      ],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ feedback: text || "(empty response)" });
  } catch (e) {
    console.error("[/api/feedback] error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}