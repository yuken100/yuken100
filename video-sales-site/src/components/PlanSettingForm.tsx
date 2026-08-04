"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SitePlan } from "@/lib/plan";

export default function PlanSettingForm({ currentPlan }: { currentPlan: SitePlan }) {
  const router = useRouter();
  const [plan, setPlan] = useState<SitePlan>(currentPlan);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-center gap-4">
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value as SitePlan)}
        className="rounded-lg border border-tiffany-200 px-4 py-2.5 text-sm focus:border-tiffany-400 focus:outline-none"
      >
        <option value="BASIC">ベーシック(動画販売のみ)</option>
        <option value="PRO">プロ(動画販売 + レッスン予約)</option>
      </select>
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
