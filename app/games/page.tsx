import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Bug, ArrowRight } from "lucide-react";
import GamesAnimations from "./games-animations";

export default function GamesPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Mini-games</h1>
        <p className="text-muted-foreground mt-1">
          Quick challenges to sharpen your Python instincts.
        </p>
      </div>

      <GamesAnimations>
        <Link href="/games/predict" className="block group">
          <Card className="h-full transition-all group-hover:border-purple-500 group-hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Output Predictor
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </CardTitle>
              <CardDescription>
                Read Python code and predict what it prints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">5 challenges · 5–12 XP each</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/games/debug" className="block group">
          <Card className="h-full transition-all group-hover:border-red-500 group-hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center mb-2">
                <Bug className="h-6 w-6" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Debug the Snippet
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </CardTitle>
              <CardDescription>
                Find and fix the bug to make the code work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">3 challenges · 5–8 XP each</p>
            </CardContent>
          </Card>
        </Link>
      </GamesAnimations>
    </div>
  );
}