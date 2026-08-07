"use client";

import { useState } from "react";

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-tiffany-300 px-4 py-2 text-xs font-semibold text-tiffany-700 hover:bg-tiffany-50"
    >
      {copied ? "コピーしました" : label}
    </button>
  );
}
