"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On success this component unmounts once router.refresh() lands, since
  // the parent then renders the booking with status CANCELLED (a persistent
  // "キャンセル済み" badge) instead of this button — that badge is the
  // durable confirmation the cancellation actually completed.
  async function handleCancel() {
    if (!confirm("この予約をキャンセルしますか?")) return;

    setLoading(true);
    setError(null);
    const res = await fetch(`/api/lessons/bookings/${bookingId}/cancel`, { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "キャンセルに失敗しました。");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-60"
      >
        {loading ? "処理中..." : "キャンセルする"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
