"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Values = {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
};

export default function ResellerBusinessForm({
  userId,
  initialValues,
}: {
  userId: string;
  initialValues: Values;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/resellers/${userId}/business`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "保存に失敗しました。");
      return;
    }

    router.push("/admin/resellers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium text-tiffany-800">
        事業者名(屋号)
        <input
          value={values.businessName}
          onChange={(e) => update("businessName", e.target.value)}
          className="input mt-1"
        />
      </label>
      <label className="block text-sm font-medium text-tiffany-800">
        住所
        <input
          value={values.businessAddress}
          onChange={(e) => update("businessAddress", e.target.value)}
          className="input mt-1"
        />
      </label>
      <label className="block text-sm font-medium text-tiffany-800">
        電話番号
        <input
          value={values.businessPhone}
          onChange={(e) => update("businessPhone", e.target.value)}
          className="input mt-1"
        />
      </label>
      <label className="block text-sm font-medium text-tiffany-800">
        連絡先メールアドレス
        <input
          type="email"
          value={values.businessEmail}
          onChange={(e) => update("businessEmail", e.target.value)}
          className="input mt-1"
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "保存中..." : "保存する"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d9f4f1;
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #5cc9be;
        }
      `}</style>
    </form>
  );
}
