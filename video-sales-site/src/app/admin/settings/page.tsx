import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import LessonsVisibilityForm from "@/components/LessonsVisibilityForm";
import InstructorProfileForm from "@/components/InstructorProfileForm";
import AnnouncementForm from "@/components/AnnouncementForm";

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/settings");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">サイト設定</h1>

      <section className="mt-8 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">レッスン予約機能</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          オンにすると、レッスン予約・カレンダーのページとメニューが表示されます。オフにすると、動画講座の販売のみのサイトになります。
        </p>
        <LessonsVisibilityForm initialEnabled={settings?.lessonsEnabled ?? true} />
      </section>

      <section className="mt-8 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">トップページのお知らせ</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          トップページ上部に表示するお知らせです。新着レッスンなどの案内以外に伝えたいことがあるときにお使いください。
        </p>
        <AnnouncementForm
          initialValues={{
            announcementEnabled: settings?.announcementEnabled ?? false,
            announcementText: settings?.announcementText ?? "",
            announcementUrl: settings?.announcementUrl ?? "",
          }}
        />
      </section>

      <section className="mt-8 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">講師プロフィール</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          トップページに表示する講師紹介セクションの内容です。
        </p>
        <InstructorProfileForm
          initialValues={{
            instructorName: settings?.instructorName ?? "",
            instructorBio: settings?.instructorBio ?? "",
            instructorPhotoUrl: settings?.instructorPhotoUrl ?? "",
            instructorPhotoPosition: settings?.instructorPhotoPosition ?? "50% 50%",
          }}
        />
      </section>
    </div>
  );
}
