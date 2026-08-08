"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClearCopyHistoryButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClear() {
    if (!confirm("変更履歴をすべて削除しますか?この操作は取り消せません。")) return;

    setLoading(true);
    await fetch("/api/admin/settings/copy/history", { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClear}
      disabled={loading}
      className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      すべて削除
    </button>
  );
}
