"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("会員プランを解約しますか?期間終了まではこれまで通り視聴いただけます。")) return;

    setLoading(true);
    await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="rounded-full border border-tiffany-200 px-5 py-2.5 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50 disabled:opacity-60"
    >
      {loading ? "処理中..." : "解約する"}
    </button>
  );
}
