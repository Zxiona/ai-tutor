import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { xp } = await req.json();
    if (typeof xp !== "number" || xp < 0 || xp > 50) {
      return NextResponse.json({ error: "Invalid xp" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({ xp: (profile?.xp ?? 0) + xp })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/games/award] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}