import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { levelForXp, xpInCurrentLevel } from "@/lib/xp";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Gamepad2, Trophy, Flame, Zap, Target, CheckCircle2, XCircle } from "lucide-react";
import DashboardAnimations from "./dashboard-animations";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, xp, current_streak, longest_streak")
    .eq("id", user.id)
    .single();

  const { data: recent } = await supabase
    .from("attempts")
    .select("id, passed, created_at, lessons(title, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const xp = profile?.xp ?? 0;
  const level = levelForXp(xp);
  const xpInLevel = xpInCurrentLevel(xp);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      <DashboardAnimations>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {profile?.username ?? "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Keep the streak alive — every lesson counts.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Target className="h-4 w-4" />} label="Level" value={level} />
          <StatCard icon={<Zap className="h-4 w-4" />} label="Total XP" value={xp} />
          <StatCard icon={<Flame className="h-4 w-4" />} label="Streak" value={`${profile?.current_streak ?? 0} days`} />
          <StatCard icon={<Trophy className="h-4 w-4" />} label="Best" value={`${profile?.longest_streak ?? 0} days`} />
        </div>

        {/* Level progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progress to level {level + 1}</span>
              <Badge variant="secondary">{xpInLevel} / 100 XP</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={xpInLevel} className="h-3" />
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button asChild size="lg" className="h-auto py-6">
            <Link href="/lessons">
              <BookOpen className="mr-2 h-5 w-5" /> Lessons
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="h-auto py-6">
            <Link href="/games">
              <Gamepad2 className="mr-2 h-5 w-5" /> Mini-games
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto py-6">
            <Link href="/leaderboard">
              <Trophy className="mr-2 h-5 w-5" /> Leaderboard
            </Link>
          </Button>
        </div>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Your last 5 attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {recent && recent.length > 0 ? (
              <ul className="space-y-2">
                {recent.map((a) => {
                  const lessonTitle = Array.isArray(a.lessons)
                    ? a.lessons[0]?.title
                    : (a.lessons as { title?: string } | null)?.title;
                  return (
                    <li
                      key={a.id}
                      className="flex justify-between items-center p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {a.passed
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <XCircle className="h-4 w-4 text-red-500" />}
                        {lessonTitle ?? "Unknown lesson"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No attempts yet — go try a lesson!
              </p>
            )}
          </CardContent>
        </Card>
      </DashboardAnimations>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
          {icon} {label}
        </div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}