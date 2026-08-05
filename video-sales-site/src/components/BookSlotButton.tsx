"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PendingConfirmationNotice from "./PendingConfirmationNotice";

export default function BookSlotButton({
  slotId,
  priceJpy,
  isMember = false,
}: {
  slotId: string;
  priceJpy: number;
  isMember?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isFree = priceJpy === 0;
  // Active members skip payment entirely regardless of price, via the same
  // endpoint used for free lessons — the server decides confirmed vs pending.
  const useFreeEndpoint = isFree || isMember;

  async function handleBook() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        useFreeEndpoint ? `/api/lessons/slots/${slotId}/book-free` : "/api/checkout/stripe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: useFreeEndpoint ? undefined : JSON.stringify({ type: "lesson_slot", slotId }),
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

      if (data.confirmed) {
        setConfirmed(true);
        router.refresh();
        return;
      }

      if (data.pending) {
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

  if (confirmed) {
    return (
      <span className="rounded-full bg-tiffany-50 px-5 py-2 text-sm font-semibold text-tiffany-700">
        予約が完了しました
      </span>
    );
  }

  if (pending) {
    return (
      <div className="max-w-xs space-y-2">
        <p className="text-sm font-bold text-red-500">まだ予約は完了していません</p>
        <PendingConfirmationNotice />
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
