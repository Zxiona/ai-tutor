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
    // Claude API prompt
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system:
        "You are a patient, encouraging programming tutor for beginners. " +
        "When reviewing student code: (1) note what they are doing well, " +
        "(2) identify one concrete issue if any, (3) give a detailed hint that will help them learn and prompt them towards the solution, not the full solution. " +
        "(4) go through why the issue occurs and teach them the relevant concept. " +
        "Aim for around 120 words. if you must choose, prioritize clear, effective teaching over staying under 120 words. Use plain English, explain technical terms in simple language.",
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

    // Extract just the text blocks and join them
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