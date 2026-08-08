"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCopyHistoryButton({ historyId }: { historyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("この履歴を削除しますか?この操作は取り消せません。")) return;

    setLoading(true);
    await fetch(`/api/admin/settings/copy/history/${historyId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      削除
    </button>
  );
}
