/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Global type augmentation for the script tag Pyodide injects
declare global {
  interface Window {
    loadPyodide: (opts?: { indexURL?: string }) => Promise<any>;
  }
}

let pyodidePromise: Promise<any> | null = null;

const PYODIDE_VERSION = "0.29.3";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export function getPyodide() {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = new Promise(async (resolve, reject) => {
    try {
      // Inject pyodide.js if not already there
      if (!window.loadPyodide) {
        await new Promise<void>((res, rej) => {
          const script = document.createElement("script");
          script.src = `${PYODIDE_URL}pyodide.js`;
          script.onload = () => res();
          script.onerror = () => rej(new Error("Failed to load Pyodide"));
          document.head.appendChild(script);
        });
      }
      const pyodide = await window.loadPyodide({ indexURL: PYODIDE_URL });
      resolve(pyodide);
    } catch (e) {
      pyodidePromise = null;
      reject(e);
    }
  });

  return pyodidePromise;
}

export type RunResult = {
  stdout: string;
  stderr: string;
  error: string | null;
};

export async function runPython(code: string): Promise<RunResult> {
  const pyodide = await getPyodide();

  // Capture stdout/stderr
  let stdout = "";
  let stderr = "";
  pyodide.setStdout({ batched: (s: string) => (stdout += s + "\n") });
  pyodide.setStderr({ batched: (s: string) => (stderr += s + "\n") });

  try {
    await pyodide.runPythonAsync(code);
    return { stdout, stderr, error: null };
  } catch (e: any) {
    return { stdout, stderr, error: String(e.message ?? e) };
  }
}