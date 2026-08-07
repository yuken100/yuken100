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
  const session = await getServerSession(authOptions);

  if (isFree) {
    if (session) {
      await prisma.purchase.upsert({
        where: { userId_videoId: { userId: session.user.id, videoId: video.id } },
        update: {},
        create: { userId: session.user.id, videoId: video.id, amountJpy: 0, provider: "free" },
      });
    }
  } else {
    if (!session) redirect(`/login?callbackUrl=/watch/${params.slug}`);

    const unlocked = await canWatchVideo(session.user.id, video.id);
    if (!unlocked) redirect(`/courses/${video.slug}`);
  }

  if (session) {
    await prisma.videoView.upsert({
      where: { userId_videoId: { userId: session.user.id, videoId: video.id } },
      update: {},
      create: { userId: session.user.id, videoId: video.id },
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link href={`/courses/${video.slug}`} className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800">
        ← 講座詳細に戻る
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-tiffany-900">{video.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-tiffany-600">
        <span className="rounded-full bg-tiffany-100 px-3 py-1">{video.category}</span>
        <span className="rounded-full bg-tiffany-100 px-3 py-1">{video.level}</span>
        <span className="rounded-full bg-tiffany-100 px-3 py-1">{video.durationMinutes}分</span>
        <span className="rounded-full bg-tiffany-100 px-3 py-1">
          {isFree ? "無料" : `¥${video.priceJpy.toLocaleString()}`}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl2 bg-black shadow-soft">
        <VideoPlayer videoUrl={video.videoUrl} posterUrl={video.thumbnailUrl} />
      </div>

      <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-tiffany-800/80">
        {video.description}
      </p>
    </div>
  );
}
