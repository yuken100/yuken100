"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSlotForm({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [startAt, setStartAt] = useState("");
  const [capacityOverride, setCapacityOverride] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/lessons/${lessonId}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: new Date(startAt).toISOString(),
        capacityOverride: capacityOverride ? Number(capacityOverride) : null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "追加に失敗しました。");
      return;
    }

    setStartAt("");
    setCapacityOverride("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <label className="text-sm font-medium text-tiffany-800">
        日時
        <input
          required
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          className="input mt-1"
        />
      </label>
      <label className="text-sm font-medium text-tiffany-800">
        定員(空欄でレッスンの定員を使用)
        <input
          type="number"
          min={1}
          value={capacityOverride}
          onChange={(e) => setCapacityOverride(e.target.value)}
          className="input mt-1 w-40"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "追加中..." : "枠を追加"}
      </button>
      {error && <p className="w-full text-sm text-red-500">{error}</p>}

      <style jsx>{`
        .input {
          border: 1px solid #d9f4f1;
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #5cc9be;
        }
      `}</style>
    </form>
  );
}
