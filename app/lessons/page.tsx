import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import LessonsAnimations from "./lessons-animations";

export default async function LessonsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, slug, title, difficulty, topic, xp_reward")
    .order("id", { ascending: true });

  const { data: passed } = await supabase
    .from("attempts")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("passed", true);

  const completedIds = new Set((passed ?? []).map((a) => a.lesson_id));

  const difficultyVariant: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    easy: "secondary",
    medium: "default",
    hard: "destructive",
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Python Lessons</h1>
        <p className="text-muted-foreground mt-1">
          {completedIds.size} of {lessons?.length ?? 0} completed
        </p>
      </div>

      <LessonsAnimations>
        {(lessons ?? []).map((lesson) => {
          const completed = completedIds.has(lesson.id);
          return (
            <Link key={lesson.id} href={`/lessons/${lesson.slug}`} className="block group">
              <Card className="transition-all group-hover:border-primary group-hover:shadow-md">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                    <div>
                      <h2 className="font-semibold">{lesson.title}</h2>
                      <p className="text-sm text-muted-foreground">{lesson.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={difficultyVariant[lesson.difficulty] ?? "default"}>
                      {lesson.difficulty}
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">
                      +{lesson.xp_reward} XP
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </LessonsAnimations>
    </div>
  );
}