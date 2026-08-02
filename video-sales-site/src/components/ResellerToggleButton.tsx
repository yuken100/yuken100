"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResellerToggleButton({
  userId,
  isReseller,
}: {
  userId: string;
  isReseller: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/admin/resellers/${userId}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isReseller: !isReseller }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`font-semibold disabled:opacity-60 ${
        isReseller ? "text-red-500 hover:text-red-700" : "text-tiffany-600 hover:text-tiffany-800"
      }`}
    >
      {isReseller ? "解除" : "修了生にする"}
    </button>
  );
}
