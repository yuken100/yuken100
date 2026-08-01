"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "登録に失敗しました。");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">新規登録</h1>
      <p className="mt-2 text-sm text-tiffany-800/70">
        無料登録後、講座の単品購入や会員プランへの加入ができます。
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-tiffany-800">お名前</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-tiffany-200 px-4 py-2.5 text-sm focus:border-tiffany-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-tiffany-800">メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-tiffany-200 px-4 py-2.5 text-sm focus:border-tiffany-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-tiffany-800">パスワード(8文字以上)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-tiffany-200 px-4 py-2.5 text-sm focus:border-tiffany-400 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
        >
          {loading ? "登録中..." : "無料登録する"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-tiffany-800/70">
        既にアカウントをお持ちの方は
        <Link href="/login" className="ml-1 font-semibold text-tiffany-600 hover:text-tiffany-800">
          ログイン
        </Link>
      </p>
    </div>
  );
}
