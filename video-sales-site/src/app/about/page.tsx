export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-tiffany-900">スタジオについて</h1>
      <p className="mt-6 text-sm leading-relaxed text-tiffany-800/80">
        Sara Yogaは、ヨガインストラクターとして活動する方・これから目指す方に向けた
        オンライン動画講座プラットフォームです。解剖学の基礎から、現場で使える指導スキル、
        マタニティヨガやキッズヨガといった専門コースまで、実践的な内容を毎週追加しています。
      </p>
      <p className="mt-4 text-sm leading-relaxed text-tiffany-800/80">
        「優しく、心地よく、でもきちんと専門性のある学び」をコンセプトに、
        女性インストラクターの方が安心して学べる環境づくりを大切にしています。
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "配信講座数", value: "10本以上" },
          { label: "更新頻度", value: "毎週追加" },
          { label: "対応デバイス", value: "PC / スマホ / タブレット" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl2 bg-tiffany-50 p-6 text-center">
            <p className="text-2xl font-bold text-tiffany-700">{item.value}</p>
            <p className="mt-1 text-xs text-tiffany-800/70">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
