"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PlanSubscribeButton({
  planKey,
  label,
  className,
}: {
  planKey: string;
  label: string;
  className: string;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (status === "unauthenticated") {
      router.push(`/signup?plan=${planKey}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "plan", planKey }),
      });

      if (res.status === 401) {
        router.push(`/signup?plan=${planKey}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "決済の開始に失敗しました。");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading} className={className}>
        {loading ? "処理中..." : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
