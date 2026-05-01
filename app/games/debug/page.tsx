import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DebugGame from "./debug-game";

export default async function DebugPage() {
  // Create a Supabase client that can run server-side
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch all "debug" game challenges from the database
  const { data: challenges } = await supabase
    .from("game_challenges")
    .select("id, broken_code, expected_output, xp_reward, difficulty")
    .eq("game_type", "debug");

  // Shuffle the challenges so each visit is different
  const shuffled = [...(challenges ?? [])].sort(() => Math.random() - 0.5);
  return <DebugGame challenges={shuffled} />;
}