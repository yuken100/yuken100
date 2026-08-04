import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { getSitePlan } from "@/lib/plan";
import PlanSettingForm from "@/components/PlanSettingForm";

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/settings");

  const plan = await getSitePlan();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">サイト設定</h1>

      <section className="mt-8 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">プラン</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          「プロ」プランにすると、レッスン予約システムが有効になります。「ベーシック」にすると、予約関連のページ・メニューが非表示になります。
        </p>
        <PlanSettingForm currentPlan={plan} />
      </section>
    </div>
  );
}
