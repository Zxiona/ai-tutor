"use client";

import Editor from "@monaco-editor/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
};

export default function CodeEditor({
  value,
  onChange,
  language = "python",
  height = "400px",
}: Props) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}