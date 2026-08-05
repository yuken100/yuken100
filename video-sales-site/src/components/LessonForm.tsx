"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "./ImageUploadField";

type LessonFormValues = {
  title: string;
  slug: string;
  description: string;
  format: "ONLINE" | "OFFLINE" | "HYBRID";
  location: string;
  onlineUrl: string;
  durationMinutes: number;
  capacity: number;
  priceJpy: number;
  gradientFrom: string;
  gradientTo: string;
  thumbnailUrl: string;
  thumbnailPosition: string;
  membersOnly: boolean;
  published: boolean;
};

const defaultValues: LessonFormValues = {
  title: "",
  slug: "",
  description: "",
  format: "ONLINE",
  location: "",
  onlineUrl: "",
  durationMinutes: 60,
  capacity: 8,
  priceJpy: 3300,
  gradientFrom: "#81D8D0",
  gradientTo: "#FFD2D9",
  thumbnailUrl: "",
  thumbnailPosition: "50% 50%",
  membersOnly: false,
  published: true,
};

type SlotRow = { startAt: string; capacityOverride: string };

export default function LessonForm({
  lessonId,
  initialValues,
}: {
  lessonId?: string;
  initialValues?: Partial<LessonFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<LessonFormValues>({
    ...defaultValues,
    ...initialValues,
    location: initialValues?.location ?? "",
    onlineUrl: initialValues?.onlineUrl ?? "",
    thumbnailUrl: initialValues?.thumbnailUrl ?? "",
    thumbnailPosition: initialValues?.thumbnailPosition ?? "50% 50%",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotRows, setSlotRows] = useState<SlotRow[]>([{ startAt: "", capacityOverride: "" }]);

  function update<K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateSlotRow(index: number, patch: Partial<SlotRow>) {
    setSlotRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addSlotRow() {
    setSlotRows((prev) => [...prev, { startAt: "", capacityOverride: "" }]);
  }

  function removeSlotRow(index: number) {
    setSlotRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = lessonId ? `/api/admin/lessons/${lessonId}` : "/api/admin/lessons";
    const method = lessonId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "保存に失敗しました。");
      return;
    }

    if (!lessonId) {
      const rowsToCreate = slotRows.filter((row) => row.startAt);
      const results = await Promise.all(
        rowsToCreate.map((row) =>
          fetch(`/api/admin/lessons/${data.id}/slots`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startAt: new Date(row.startAt).toISOString(),
              capacityOverride: row.capacityOverride ? Number(row.capacityOverride) : null,
            }),
          })
        )
      );
      setLoading(false);

      if (results.some((r) => !r.ok)) {
        setError("レッスンは作成されましたが、一部の予約枠の登録に失敗しました。枠の管理画面で確認してください。");
      }

      router.push(`/admin/lessons/${data.id}/slots`);
      router.refresh();
      return;
    }

    setLoading(false);
    router.push("/admin/lessons");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="レッスン名">
          <input
            required
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="スラッグ(URL用・半角英数)">
          <input
            required
            value={values.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="input"
            pattern="[a-z0-9\-]+"
          />
        </Field>
      </div>

      <Field label="説明文">
        <textarea
          required
          rows={4}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="レッスン形式">
          <select
            value={values.format}
            onChange={(e) => update("format", e.target.value as LessonFormValues["format"])}
            className="input"
          >
            <option value="ONLINE">オンラインのみ</option>
            <option value="OFFLINE">対面のみ</option>
            <option value="HYBRID">オンライン + 対面</option>
          </select>
        </Field>
        <Field label="長さ(分)">
          <input
            required
            type="number"
            min={1}
            value={values.durationMinutes}
            onChange={(e) => update("durationMinutes", Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="定員(人)">
          <input
            required
            type="number"
            min={1}
            value={values.capacity}
            onChange={(e) => update("capacity", Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>

      {(values.format === "OFFLINE" || values.format === "HYBRID") && (
        <Field label="場所(対面レッスンの会場)">
          <input
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            className="input"
            placeholder="例: 東京都渋谷区〇〇 スタジオ名"
          />
        </Field>
      )}

      {(values.format === "ONLINE" || values.format === "HYBRID") && (
        <Field label="オンライン参加用URL(Zoom等)">
          <input
            value={values.onlineUrl}
            onChange={(e) => update("onlineUrl", e.target.value)}
            className="input"
            placeholder="例: https://zoom.us/j/xxxxxxxxx"
          />
        </Field>
      )}

      <Field label="価格 (円)">
        <input
          required
          type="number"
          min={0}
          value={values.priceJpy}
          onChange={(e) => update("priceJpy", Number(e.target.value))}
          className="input"
        />
      </Field>

      <Field label="サムネイル画像(任意・空欄の場合は下のグラデーションを表示)">
        <ImageUploadField
          folder="yoga-studio/lessons"
          imageUrl={values.thumbnailUrl}
          position={values.thumbnailPosition}
          onImageChange={(url) => update("thumbnailUrl", url)}
          onPositionChange={(position) => update("thumbnailPosition", position)}
          sizePreviews={[
            { label: "レッスン一覧での見え方(目安: 800×360px)", className: "h-24 w-56 rounded-lg" },
            { label: "詳細ページでの見え方(目安: 960×540px)", className: "h-36 w-80 rounded-lg" },
          ]}
          buttonLabel="サムネイルをアップロード"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="サムネイル グラデーション色1(画像未設定時に使用)">
          <input
            type="color"
            value={values.gradientFrom}
            onChange={(e) => update("gradientFrom", e.target.value)}
            className="h-10 w-full"
          />
        </Field>
        <Field label="サムネイル グラデーション色2(画像未設定時に使用)">
          <input
            type="color"
            value={values.gradientTo}
            onChange={(e) => update("gradientTo", e.target.value)}
            className="h-10 w-full"
          />
        </Field>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-tiffany-800">
          <input
            type="checkbox"
            checked={values.membersOnly}
            onChange={(e) => update("membersOnly", e.target.checked)}
          />
          会員限定(非会員は予約不可)
        </label>
        <label className="flex items-center gap-2 text-sm text-tiffany-800">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          公開する
        </label>
      </div>
      <p className="text-xs text-tiffany-800/60">
        有効な会員プランに加入している方は、価格や会員限定設定に関わらず決済不要で予約が確定します。「会員限定」をオンにすると、非会員はこのレッスンを予約できなくなります。
      </p>

      {!lessonId && (
        <div className="rounded-xl2 border border-tiffany-100 bg-tiffany-50/50 p-5">
          <p className="text-sm font-semibold text-tiffany-800">
            最初の予約枠(あとから追加・編集もできます)
          </p>
          <div className="mt-3 space-y-3">
            {slotRows.map((row, index) => (
              <div key={index} className="flex flex-wrap items-end gap-3">
                <label className="text-xs font-medium text-tiffany-800">
                  日時
                  <input
                    type="datetime-local"
                    value={row.startAt}
                    onChange={(e) => updateSlotRow(index, { startAt: e.target.value })}
                    className="input mt-1"
                  />
                </label>
                <label className="text-xs font-medium text-tiffany-800">
                  定員(空欄でレッスンの定員を使用)
                  <input
                    type="number"
                    min={1}
                    value={row.capacityOverride}
                    onChange={(e) => updateSlotRow(index, { capacityOverride: e.target.value })}
                    className="input mt-1 w-48"
                  />
                </label>
                {slotRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlotRow(index)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSlotRow}
            className="mt-3 text-xs font-semibold text-tiffany-600 hover:text-tiffany-800"
          >
            + 枠を追加
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600 disabled:opacity-60"
      >
        {loading ? "保存中..." : lessonId ? "更新する" : "追加する"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-tiffany-800">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
