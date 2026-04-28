"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Check, X, ArrowRight, Trophy, Zap } from "lucide-react";

type Challenge = {
  id: number;
  code: string;
  expected_output: string;
  xp_reward: number;
  difficulty: string;
};

export default function PredictGame({ challenges }: { challenges: Challenge[] }) {
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [score, setScore] = useState(0);

  if (challenges.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No challenges available.</div>;
  }

  if (index >= challenges.length) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="space-y-4"
        >
          <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
          <h1 className="text-3xl font-bold">All done!</h1>
          <p className="text-xl text-muted-foreground">
            You earned <span className="font-bold text-foreground">{score} XP</span>
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const c = challenges[index];

  function check() {
    const norm = (s: string) => s.replace(/\r\n/g, "\n").trim();
    const correct = norm(guess) === norm(c.expected_output);
    setResult(correct ? "correct" : "wrong");
    if (correct) {
      setScore(score + c.xp_reward);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#a855f7", "#3b82f6", "#facc15"],
      });
      fetch("/api/games/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xp: c.xp_reward }),
      });
    }
  }

  function next() {
    setGuess("");
    setResult(null);
    setIndex(index + 1);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-4">
      {/* Header with progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Challenge {index + 1} of {challenges.length}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Zap className="h-3.5 w-3.5 text-yellow-500" /> {score} XP
          </span>
        </div>
        <Progress value={((index + 1) / challenges.length) * 100} className="h-1.5" />
      </div>

      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">What does this print?</h1>
        <Badge variant="outline" className="ml-auto">{c.difficulty}</Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <pre className="bg-black text-green-400 p-4 rounded-lg font-mono whitespace-pre-wrap text-sm">
            {c.code}
          </pre>

          <textarea
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={result !== null}
            rows={4}
            placeholder="Type your prediction here…"
            className="w-full p-3 border rounded-md font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {result === null ? (
          <motion.div key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button onClick={check} className="w-full" size="lg" disabled={!guess.trim()}>
              Check answer
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="space-y-3"
          >
            <Card
              className={
                result === "correct"
                  ? "border-green-300 bg-green-50/60 dark:bg-green-950/30"
                  : "border-red-300 bg-red-50/60 dark:bg-red-950/30"
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 font-medium">
                  {result === "correct" ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      Correct! +{c.xp_reward} XP
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      Not quite.
                    </>
                  )}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Expected output:
                  <pre className="mt-1 font-mono p-2 bg-background border rounded text-foreground">
                    {c.expected_output}
                  </pre>
                </div>
              </CardContent>
            </Card>
            <Button onClick={next} className="w-full" size="lg">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}