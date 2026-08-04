"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelSlotButton({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("この予約枠を削除しますか?")) return;

    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/slots/${slotId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "削除に失敗しました。");
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
        削除
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
