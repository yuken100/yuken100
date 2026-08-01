import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import VideoForm from "@/components/VideoForm";

export default async function NewVideoPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/videos/new");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">新しい動画を追加</h1>
      <VideoForm />
    </div>
  );
}
