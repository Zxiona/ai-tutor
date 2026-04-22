import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
        if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY not set on server" },
            { status: 500 }
        );
        }

        const systemInstruction =
        "You are a patient, encouraging programming tutor for beginners. " +
        "When reviewing student code: (1) note what they did well, " +
        "(2) identify one concrete issue if any, (3) give a hint, not the full solution. " +
        "Keep responses under 120 words. Use plain English, no jargon.";

        const userMessage =
    `Problem: ${prompt}

    Student's code:
    \`\`\`python
    ${studentCode}
    \`\`\`

    Program output:
    ${stdout || "(no output)"}
    ${stderr ? `\nErrors:\n${stderr}` : ""}

    Please give feedback.`;

        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: {
            systemInstruction,
            maxOutputTokens: 400,
        },
        });

        return NextResponse.json({ feedback: response.text ?? "(no response)" });
    } catch (e) {
        // Log the real error to the terminal AND return it to the client for debugging
        console.error("[/api/feedback] error:", e);
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}