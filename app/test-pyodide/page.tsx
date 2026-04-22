"use client";
import { useState } from "react";
import CodeEditor from "@/components/code-editor";
import { runPython } from "@/lib/pyodide-runner";

export default function TestPyodide() {
    const [code, setCode] = useState("print('Hello from Python!')\nfor i in range(3):\n    print(i)");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRun() {
        setLoading(true);
        setOutput("Loading Python runtime…");
        const result = await runPython(code);
        setOutput(
        (result.stdout || "") +
        (result.stderr ? "\n[stderr]\n" + result.stderr : "") +
        (result.error ? "\n[error]\n" + result.error : "")
        );
        setLoading(false);
    }

    async function getFeedback() {
    const r = await runPython(code);
    const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        prompt: "Write a program that prints the numbers 0, 1, 2.",
        studentCode: code,
        stdout: r.stdout,
        stderr: r.stderr,
        }),
    });
    const data = await res.json();
    setOutput(data.feedback ?? data.error);
    }


    return (
        <div className="p-8 space-y-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Pyodide test</h1>
        <CodeEditor value={code} onChange={setCode} />
        <button
            onClick={handleRun}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded"
        >
            {loading ? "Running…" : "Run"}
        </button>
        <button
            onClick={getFeedback}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded"
        >
            Get AI Feedback
        </button>
        <pre className="bg-black p-4 rounded text-sm whitespace-pre-wrap">{output}</pre>
        </div>
    );
}