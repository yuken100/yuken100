import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import VideoForm from "@/components/VideoForm";

export default async function EditVideoPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect(`/login?callbackUrl=/admin/videos/${params.id}/edit`);

  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">動画を編集</h1>
      <VideoForm
        videoId={video.id}
        initialValues={{ ...video, thumbnailUrl: video.thumbnailUrl ?? "" }}
      />
    </div>
  );
}
