import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PredictGame from "./predict-game";

export default async function PredictPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: challenges } = await supabase
    .from("game_challenges")
    .select("id, code, expected_output, xp_reward, difficulty")
    .eq("game_type", "predict");

  // Shuffle so each visit is different
  const shuffled = [...(challenges ?? [])].sort(() => Math.random() - 0.5);

  return <PredictGame challenges={shuffled} />;
}