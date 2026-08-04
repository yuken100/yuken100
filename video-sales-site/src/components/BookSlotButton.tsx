"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookSlotButton({
  slotId,
  priceJpy,
}: {
  slotId: string;
  priceJpy: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isFree = priceJpy === 0;

  async function handleBook() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        isFree ? `/api/lessons/slots/${slotId}/book-free` : "/api/checkout/stripe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: isFree ? undefined : JSON.stringify({ type: "lesson_slot", slotId }),
        }
      );

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "予約の開始に失敗しました。");
        return;
      }

      if (isFree) {
        setPending(true);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  if (pending) {
    return (
      <div className="max-w-xs space-y-1">
        <p className="text-sm font-bold text-red-500">まだ予約は完了していません</p>
        <p className="text-xs text-tiffany-800/70">
          ご登録のメールアドレスに予約確認メールをお送りしました。メール内のリンクをクリックすると予約が完了します。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleBook}
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-5 py-2 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "処理中..." : "予約する"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
