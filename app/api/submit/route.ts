import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalize(s: string): string {
  return s.replace(/\r\n/g, "\n").trim();
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { lessonId, code, stdout, stderr } = await req.json();
    if (typeof lessonId !== "number" || typeof code !== "string") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Get the lesson
    const { data: lesson, error: lessonErr } = await supabase
      .from("lessons")
      .select("expected_output, xp_reward")
      .eq("id", lessonId)
      .single();
    if (lessonErr || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Auto-grade: compare normalized stdout to expected_output
    const passed =
      !!lesson.expected_output &&
      !stderr &&
      normalize(stdout || "") === normalize(lesson.expected_output);

    // Has the user already passed this lesson before?
    const { data: priorPass } = await supabase
      .from("attempts")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .eq("passed", true)
      .limit(1)
      .maybeSingle();

    // Award XP only on first-time passes
    const firstPass = passed && !priorPass;
    const xpAwarded = firstPass ? lesson.xp_reward : 0;

    // Insert the attempt
    await supabase.from("attempts").insert({
      user_id: user.id,
      lesson_id: lessonId,
      code,
      passed,
    });

    // If first pass, update profile XP and streak
    if (firstPass) {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, current_streak, longest_streak, last_active_date")
        .eq("id", user.id)
        .single();

      let newStreak = 1;
      if (profile?.last_active_date) {
        const last = new Date(profile.last_active_date);
        const todayDate = new Date(today);
        const diffDays = Math.round(
          (todayDate.getTime() - last.getTime()) / 86400000
        );
        if (diffDays === 0) newStreak = profile.current_streak; // already active today
        else if (diffDays === 1) newStreak = profile.current_streak + 1; // consecutive
        else newStreak = 1;                                              // reset streak
      }

      const newLongest = Math.max(
        profile?.longest_streak ?? 0,
        newStreak
      );

      // Update the profile with new XP and streak info
      await supabase
        .from("profiles")
        .update({
          xp: (profile?.xp ?? 0) + xpAwarded,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_active_date: today,
        })
        .eq("id", user.id);
    }

    // Return the result of the attempt and XP awarded
    return NextResponse.json({ passed, xpAwarded });
  } catch (e) {
    console.error("[/api/submit] error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}