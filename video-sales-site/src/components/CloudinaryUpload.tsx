"use client";

import { useRef, useState } from "react";

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  children?: React.ReactNode;
}

export default function CloudinaryUpload({
  onUpload,
  folder = "yoga-studio",
  children,
}: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "yoga_studio_unsigned");
      formData.append("folder", folder);
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        onUpload(data.secure_url);
      } else {
        console.error("Upload failed:", data);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isLoading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-full border border-tiffany-300 bg-white px-4 py-2 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50 disabled:opacity-50"
      >
        {isLoading ? "アップロード中..." : children || "画像を選択"}
      </button>
    </>
  );
}
