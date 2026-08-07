"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LessonsVisibilityForm({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonsEnabled: enabled }),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-sm text-tiffany-800">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        レッスン予約・カレンダーを表示する
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "保存中..." : "保存する"}
      </button>
      {saved && <span className="text-sm text-tiffany-600">保存しました</span>}
    </form>
  );
}
