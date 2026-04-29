import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Code2, Trophy } from "lucide-react";
import HomeHero from "./home-hero";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <HomeHero>
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered Python tutor
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Learn Python by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              doing
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bite-sized lessons, instant feedback from an AI tutor, and gamified
            challenges that turn learning into something you actually want to do.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-20">
          <Feature
            icon={<Code2 className="h-6 w-6" />}
            title="Real Python, in your browser"
            body="Code runs instantly with WebAssembly. No installs."
          />
          <Feature
            icon={<Sparkles className="h-6 w-6" />}
            title="AI tutor that helps, not solves"
            body="Get hints when stuck — never the answer handed to you."
          />
          <Feature
            icon={<Trophy className="h-6 w-6" />}
            title="XP, streaks, leaderboards"
            body="The dopamine hit of progress, applied to real coding skills."
          />
        </div>
      </HomeHero>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="p-6 rounded-xl border bg-card">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}