"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import CodeEditor from "@/components/code-editor";
import { runPython } from "@/lib/pyodide-runner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bug, Play, Check, ArrowRight, Trophy, Zap } from "lucide-react";

type Challenge = {
  id: number;
  broken_code: string;
  expected_output: string;
  xp_reward: number;
  difficulty: string;
};

export default function DebugGame({ challenges }: { challenges: Challenge[] }) {
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (challenges[index]) setCode(challenges[index].broken_code);
  }, [index, challenges]);

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

  async function run() {
    setRunning(true);
    const r = await runPython(code);
    const text =
      (r.stdout || "") +
      (r.stderr ? `\n[stderr]\n${r.stderr}` : "") +
      (r.error ? `\n[error]\n${r.error}` : "");
    setOutput(text);

    const norm = (s: string) => s.replace(/\r\n/g, "\n").trim();
    const correct = !r.stderr && !r.error && norm(r.stdout) === norm(c.expected_output);
    setResult(correct ? "correct" : "wrong");
    if (correct) {
      setScore(score + c.xp_reward);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ef4444", "#f97316", "#facc15"],
      });
      fetch("/api/games/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xp: c.xp_reward }),
      });
    }
    setRunning(false);
  }

  function next() {
    setOutput("");
    setResult(null);
    setIndex(index + 1);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-4">
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
        <Bug className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold">Fix the bug</h1>
        <Badge variant="outline" className="ml-auto">{c.difficulty}</Badge>
      </div>

      <Card className="bg-muted/40">
        <CardContent className="p-3 text-sm">
          <span className="text-muted-foreground">Expected output: </span>
          <code className="font-mono">{c.expected_output.replace(/\n/g, " ⏎ ")}</code>
        </CardContent>
      </Card>

      <CodeEditor value={code} onChange={setCode} height="250px" />

      <Button
        onClick={run}
        disabled={running || result === "correct"}
        size="lg"
        variant={result === "correct" ? "outline" : "default"}
      >
        <Play className="mr-2 h-4 w-4" />
        {running ? "Running…" : "Run & check"}
      </Button>

      <AnimatePresence mode="wait">
        {output && (
          <motion.div
            key="output"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <pre className="bg-black text-green-400 p-3 rounded-lg text-sm whitespace-pre-wrap font-mono">
              {output}
            </pre>
          </motion.div>
        )}

        {result === "correct" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="space-y-3"
          >
            <Card className="border-green-300 bg-green-50/60 dark:bg-green-950/30">
              <CardContent className="p-4 flex items-center gap-2 font-medium">
                <Check className="h-5 w-5 text-green-600" />
                Fixed it! +{c.xp_reward} XP
              </CardContent>
            </Card>
            <Button onClick={next} className="w-full" size="lg">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {result === "wrong" && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="border-yellow-300 bg-yellow-50/60 dark:bg-yellow-950/30">
              <CardContent className="p-4 text-sm">
                Not yet. Keep trying!
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}