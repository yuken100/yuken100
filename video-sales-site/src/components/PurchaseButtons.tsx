"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PurchaseButtons({
  videoId,
  membersOnly,
}: {
  videoId: string;
  membersOnly: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"stripe" | "paypal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(provider: "stripe" | "paypal") {
    setError(null);
    setLoading(provider);
    try {
      const res = await fetch(`/api/checkout/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "video", videoId }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "決済の開始に失敗しました。");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!membersOnly && (
        <>
          <button
            onClick={() => startCheckout("stripe")}
            disabled={loading !== null}
            className="rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
          >
            {loading === "stripe" ? "処理中..." : "クレジットカードで購入 (Stripe)"}
          </button>
          <button
            onClick={() => startCheckout("paypal")}
            disabled={loading !== null}
            className="rounded-full border border-tiffany-300 bg-white px-6 py-3 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50 disabled:opacity-60"
          >
            {loading === "paypal" ? "処理中..." : "PayPalで購入"}
          </button>
        </>
      )}
      {membersOnly && (
        <a
          href="/pricing"
          className="rounded-full bg-tiffany-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600"
        >
          会員プランに加入して視聴する
        </a>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
