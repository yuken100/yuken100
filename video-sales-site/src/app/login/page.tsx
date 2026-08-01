"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">ログイン</h1>
      <p className="mt-2 text-sm text-tiffany-800/70">
        デモ用アカウント: demo@yoga-studio.example.com / demo1234
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          <label className="text-sm font-medium text-tiffany-800">パスワード</label>
          <input
            type="password"
            required
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
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-tiffany-800/70">
        アカウントをお持ちでない方は
        <Link href="/signup" className="ml-1 font-semibold text-tiffany-600 hover:text-tiffany-800">
          新規登録
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
