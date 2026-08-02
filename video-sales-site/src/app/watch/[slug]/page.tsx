import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWatchVideo } from "@/lib/access";
import VideoPlayer from "@/components/VideoPlayer";

export default async function WatchPage({ params }: { params: { slug: string } }) {
  const video = await prisma.video.findUnique({ where: { slug: params.slug } });
  if (!video || !video.published) notFound();

  const isFree = video.priceJpy === 0 && !video.membersOnly;

  if (!isFree) {
    const session = await getServerSession(authOptions);
    if (!session) redirect(`/login?callbackUrl=/watch/${params.slug}`);

    const unlocked = await canWatchVideo(session.user.id, video.id);
    if (!unlocked) redirect(`/courses/${video.slug}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link href={`/courses/${video.slug}`} className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800">
        ← 講座詳細に戻る
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-tiffany-900">{video.title}</h1>

      <div className="mt-6 overflow-hidden rounded-xl2 bg-black shadow-soft">
        <VideoPlayer videoUrl={video.videoUrl} />
      </div>

      <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-tiffany-800/80">
        {video.description}
      </p>
    </div>
  );
}
