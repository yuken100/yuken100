"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSignRequest = async (callback: (arg0: any) => void) => {
    try {
      const response = await fetch("/api/cloudinary/sign", {
        method: "POST",
        body: JSON.stringify({ folder }),
      });
      const data = await response.json();
      callback(data);
    } catch (error) {
      console.error("Signature request failed:", error);
    }
  };

  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary/sign"
      uploadPreset={undefined}
      options={{
        folder,
      }}
      onSuccess={(result: any) => {
        setIsLoading(false);
        onUpload(result.info.secure_url);
      }}
      onError={() => {
        setIsLoading(false);
      }}
      onOpen={() => setIsLoading(true)}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full border border-tiffany-300 bg-white px-4 py-2 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50 disabled:opacity-50"
        >
          {isLoading ? "アップロード中..." : children || "画像を選択"}
        </button>
      )}
    </CldUploadWidget>
  );
}
