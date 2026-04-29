"use client";

import { useState } from "react";
import Link from "next/link";
import CodeEditor from "@/components/code-editor";
import { runPython } from "@/lib/pyodide-runner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Lightbulb, Check, ArrowLeft, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

type Lesson = {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  topic: string;
  prompt: string;
  starter_code: string;
  expected_output: string | null;
  xp_reward: number;
};

export default function LessonView({ lesson }: { lesson: Lesson }) {
  const [code, setCode] = useState(lesson.starter_code);
  const [output, setOutput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<null | {
    passed: boolean;
    xpAwarded: number;
  }>(null);

  async function handleRun() {
    setRunning(true);
    setOutput("Running…");
    const result = await runPython(code);
    setOutput(
      (result.stdout || "(no output)") +
        (result.stderr ? `\n[stderr]\n${result.stderr}` : "") +
        (result.error ? `\n[error]\n${result.error}` : "")
    );
    setRunning(false);
  }

  async function handleFeedback() {
    setFeedbackLoading(true);
    setFeedback("Thinking…");
    const r = await runPython(code);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: lesson.prompt,
          studentCode: code,
          stdout: r.stdout,
          stderr: r.stderr,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(`Error: ${data.error ?? "unknown"}`);
      } else {
        setFeedback(data.feedback ?? "(no feedback)");
      }
    } catch (e) {
      setFeedback(`Error: ${String(e)}`);
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitResult(null);
    const r = await runPython(code);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          code,
          stdout: r.stdout,
          stderr: r.stderr,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOutput(`Submit error: ${data.error ?? "unknown"}`);
      } else {
        setSubmitResult({ passed: data.passed, xpAwarded: data.xpAwarded });
        if (data.passed) {
          confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.7 },
              colors: ["#22c55e", "#3b82f6", "#a855f7", "#facc15"],
          });
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-4">
        <Link
        href="/lessons"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
        <ArrowLeft className="h-4 w-4" /> All lessons
        </Link>

        <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <div className="flex gap-2 items-center mt-2">
            <Badge variant="outline">{lesson.difficulty}</Badge>
            <Badge variant="outline">{lesson.topic}</Badge>
            <Badge variant="secondary">+{lesson.xp_reward} XP</Badge>
        </div>
        </div>

        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30">
        <CardContent className="p-4">
            <p className="font-medium">{lesson.prompt}</p>
        </CardContent>
        </Card>

        <CodeEditor value={code} onChange={setCode} />

        <div className="flex gap-2 flex-wrap">
        <Button onClick={handleRun} disabled={running} variant="default">
            <Play className="mr-2 h-4 w-4" />
            {running ? "Running…" : "Run"}
        </Button>
        <Button onClick={handleFeedback} disabled={feedbackLoading} variant="secondary">
            <Lightbulb className="mr-2 h-4 w-4" />
            {feedbackLoading ? "Thinking…" : "Get hint"}
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} variant="outline">
            <Check className="mr-2 h-4 w-4" />
            {submitting ? "Submitting…" : "Submit"}
        </Button>
        </div>

        <AnimatePresence mode="wait">
        {output && (
            <motion.div
            key="output"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            >
            <h3 className="text-sm font-semibold mb-1">Output</h3>
            <pre className="bg-black text-green-400 p-3 rounded-lg text-sm whitespace-pre-wrap font-mono">
                {output}
            </pre>
            </motion.div>
        )}

        {feedback && (
            <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            >
            <Card className="bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
                <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-purple-900 dark:text-purple-100">
                    <Sparkles className="h-4 w-4" /> AI Tutor
                </div>
                <div className="whitespace-pre-wrap text-sm">{feedback}</div>
                </CardContent>
            </Card>
            </motion.div>
        )}

        {submitResult && (
            <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
            <Card
                className={
                submitResult.passed
                    ? "bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-900"
                    : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900"
                }
            >
                <CardContent className="p-4 font-medium">
                {submitResult.passed
                    ? `🎉 Correct! +${submitResult.xpAwarded} XP`
                    : "❌ Not quite — your output didn't match the expected result. Try again!"}
                </CardContent>
            </Card>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
    );
}