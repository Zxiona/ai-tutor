import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { levelForXp } from "@/lib/xp";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Medal } from "lucide-react";
import LeaderboardAnimations from "./leaderboard-animations";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: top } = await supabase
    .from("profiles")
    .select("id, username, xp, current_streak")
    .order("xp", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">Top 20 by total XP</p>
        </div>
      </div>

      <LeaderboardAnimations>
        {(top ?? []).map((p, i) => {
          const isMe = p.id === user.id;
          const rank = i + 1;
          return (
            <Card
              key={p.id}
              className={
                isMe
                  ? "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/30"
                  : ""
              }
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RankBadge rank={rank} />
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {p.username ?? "anon"}
                      {isMe && (
                        <Badge variant="outline" className="text-xs">
                          you
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                      <span>Level {levelForXp(p.xp)}</span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" /> {p.current_streak}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-lg font-semibold">
                  {p.xp.toLocaleString()} <span className="text-xs text-muted-foreground">XP</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </LeaderboardAnimations>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="h-10 w-10 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center">
        <Medal className="h-5 w-5" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-300 text-gray-800 flex items-center justify-center">
        <Medal className="h-5 w-5" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="h-10 w-10 rounded-full bg-amber-700 text-amber-50 flex items-center justify-center">
        <Medal className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
      #{rank}
    </div>
  );
}