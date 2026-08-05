import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWatchVideo } from "@/lib/access";
import { getReferringReseller } from "@/lib/referral";
import VideoThumb from "@/components/VideoThumb";
import PurchaseButtons from "@/components/PurchaseButtons";
import TestimonialSection from "@/components/TestimonialSection";
import TestimonialSubmitForm from "@/components/TestimonialSubmitForm";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const video = await prisma.video.findUnique({ where: { slug: params.slug } });
  if (!video || !video.published) notFound();

  const session = await getServerSession(authOptions);
  const unlocked = session ? await canWatchVideo(session.user.id, video.id) : false;
  const reseller = await getReferringReseller();
  const isFree = video.priceJpy === 0 && !video.membersOnly;
  const testimonials = await prisma.testimonial.findMany({
    where: { published: true, videoId: video.id },
    orderBy: { createdAt: "desc" },
  });
  const canReview = Boolean(session) && (isFree || unlocked);
  const myTestimonial = canReview
    ? await prisma.testimonial.findFirst({
        where: { userId: session!.user.id, videoId: video.id },
      })
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/courses" className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800">
        ← 講座一覧に戻る
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-5">
        <div className="md:col-span-3">
          <VideoThumb
            from={video.gradientFrom}
            to={video.gradientTo}
            level={video.level}
            imageUrl={video.thumbnailUrl}
            imagePosition={video.thumbnailPosition}
            className="h-64 w-full md:h-80"
          />

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-tiffany-600">
            <span className="rounded-full bg-tiffany-100 px-3 py-1">{video.category}</span>
            <span className="rounded-full bg-tiffany-100 px-3 py-1">{video.level}</span>
            <span className="rounded-full bg-tiffany-100 px-3 py-1">{video.durationMinutes}分</span>
            {video.membersOnly && (
              <span className="rounded-full bg-blush-100 px-3 py-1 text-blush-300">会員限定</span>
            )}
            {isFree && (
              <span className="rounded-full bg-tiffany-100 px-3 py-1 text-tiffany-600">無料</span>
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold text-tiffany-900 md:text-3xl">
            {video.title}
          </h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-tiffany-800/80">
            {video.description}
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
            <p className="text-3xl font-bold text-tiffany-900">
              {isFree ? (
                "無料"
              ) : (
                <>
                  ¥{video.priceJpy.toLocaleString()}
                  <span className="text-sm font-medium text-tiffany-800/60"> (税込)</span>
                </>
              )}
            </p>

            {isFree || unlocked ? (
              <Link
                href={`/watch/${video.slug}`}
                className="mt-6 block rounded-full bg-tiffany-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600"
              >
                {isFree ? "無料で視聴する" : "視聴する"}
              </Link>
            ) : (
              <div className="mt-6">
                <PurchaseButtons
                  videoId={video.id}
                  membersOnly={video.membersOnly}
                  viaReseller={Boolean(reseller)}
                />
              </div>
            )}

            <p className="mt-4 text-xs text-tiffany-800/60">
              会員プランに加入すると、この講座を含む全講座が見放題になります。
              <Link href="/pricing" className="ml-1 font-semibold text-tiffany-600 hover:text-tiffany-800">
                詳しく見る
              </Link>
            </p>

            {reseller && !unlocked && (
              <div className="mt-4 rounded-lg bg-tiffany-50 p-4 text-xs text-tiffany-800/70">
                <p className="font-semibold text-tiffany-800">販売事業者情報</p>
                <p className="mt-1">{reseller.businessName ?? reseller.name}</p>
                {reseller.businessAddress && <p>{reseller.businessAddress}</p>}
                {reseller.businessPhone && <p>{reseller.businessPhone}</p>}
                {reseller.businessEmail && <p>{reseller.businessEmail}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {canReview && (
        <div className="mt-10 max-w-2xl">
          {myTestimonial ? (
            <div className="rounded-xl2 border border-tiffany-100 bg-white p-6 text-sm text-tiffany-800/70 shadow-sm">
              {myTestimonial.published
                ? "あなたが投稿した口コミは公開されています。"
                : "口コミを投稿済みです。確認後に掲載されます。"}
            </div>
          ) : (
            <TestimonialSubmitForm videoId={video.id} defaultName={session?.user.name ?? undefined} />
          )}
        </div>
      )}

      <TestimonialSection testimonials={testimonials} title="この講座を受けた生徒さんの声" />
    </div>
  );
}
