"use client";

import CloudinaryUpload from "./CloudinaryUpload";

function parsePosition(position: string): { x: number; y: number } {
  const [x, y] = position.split(" ").map((part) => parseInt(part, 10));
  return { x: Number.isFinite(x) ? x : 50, y: Number.isFinite(y) ? y : 50 };
}

type SizePreview = { label: string; className: string };

export default function ImageUploadField({
  folder,
  imageUrl,
  position,
  onImageChange,
  onPositionChange,
  previewClassName = "h-24 w-full rounded-lg",
  sizePreviews,
  buttonLabel = "画像をアップロード",
}: {
  folder: string;
  imageUrl: string;
  position: string;
  onImageChange: (url: string) => void;
  onPositionChange: (position: string) => void;
  previewClassName?: string;
  sizePreviews?: SizePreview[];
  buttonLabel?: string;
}) {
  const { x, y } = parsePosition(position);

  return (
    <div>
      {imageUrl && (
        <div className="mb-3">
          {sizePreviews ? (
            <div className="flex flex-wrap gap-4">
              {sizePreviews.map((preview) => (
                <div key={preview.label}>
                  <p className="mb-1 text-xs font-medium text-tiffany-800/70">{preview.label}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={preview.label}
                    className={`${preview.className} object-cover`}
                    style={{ objectPosition: position }}
                  />
                </div>
              ))}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Preview"
              className={`${previewClassName} object-cover`}
              style={{ objectPosition: position }}
            />
          )}
          <div className="mt-2 space-y-1">
            <label className="flex items-center gap-2 text-xs text-tiffany-800/70">
              横位置
              <input
                type="range"
                min={0}
                max={100}
                value={x}
                onChange={(e) => onPositionChange(`${e.target.value}% ${y}%`)}
                className="flex-1"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-tiffany-800/70">
              縦位置
              <input
                type="range"
                min={0}
                max={100}
                value={y}
                onChange={(e) => onPositionChange(`${x}% ${e.target.value}%`)}
                className="flex-1"
              />
            </label>
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <CloudinaryUpload folder={folder} onUpload={(url) => onImageChange(url)}>
          {imageUrl ? "変更する" : buttonLabel}
        </CloudinaryUpload>
        {imageUrl && (
          <button
            type="button"
            onClick={() => {
              onImageChange("");
              onPositionChange("50% 50%");
            }}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}
