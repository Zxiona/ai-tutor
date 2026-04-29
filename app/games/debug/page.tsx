import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DebugGame from "./debug-game";

export default async function DebugPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: challenges } = await supabase
    .from("game_challenges")
    .select("id, broken_code, expected_output, xp_reward, difficulty")
    .eq("game_type", "debug");

  const shuffled = [...(challenges ?? [])].sort(() => Math.random() - 0.5);
  return <DebugGame challenges={shuffled} />;
}