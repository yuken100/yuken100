import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAMPLE_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const gradients: [string, string][] = [
  ["#81D8D0", "#FFD2D9"],
  ["#B3E9E3", "#FFE9EC"],
  ["#5CC9BE", "#FFB0BC"],
  ["#D9F4F1", "#F0E7D8"],
  ["#3BB3A7", "#F8F3EA"],
];

const videos = [
  {
    slug: "beginner-alignment-basics",
    title: "解剖学から学ぶ基礎アライメント入門",
    description:
      "指導を始めたばかりの方向けに、代表的なポーズの骨格アライメントと安全な誘導の言葉がけを解説します。",
    category: "基礎解剖学",
    level: "初級",
    durationMinutes: 42,
    priceJpy: 3300,
    membersOnly: false,
  },
  {
    slug: "cueing-language-workshop",
    title: "伝わるキューイング(声かけ)実践講座",
    description:
      "生徒がイメージしやすい言葉選びと、テンポの取り方をロールプレイ形式で学ぶワークショップ収録です。",
    category: "指導スキル",
    level: "初級〜中級",
    durationMinutes: 55,
    priceJpy: 3800,
    membersOnly: false,
  },
  {
    slug: "hands-on-adjustment-safety",
    title: "安全なハンズオンアジャストの基本",
    description:
      "同意の取り方から圧のかけ方まで、ハンズオン指導で気をつけたいポイントを丁寧に解説します。",
    category: "指導スキル",
    level: "中級",
    durationMinutes: 48,
    priceJpy: 4200,
    membersOnly: true,
  },
  {
    slug: "prenatal-yoga-teaching",
    title: "マタニティヨガ指導者養成講座",
    description:
      "妊娠期の身体の変化を理解し、安全に配慮したシークエンス設計とNGポーズを学びます。",
    category: "専門コース",
    level: "中級",
    durationMinutes: 68,
    priceJpy: 5800,
    membersOnly: true,
  },
  {
    slug: "sequencing-vinyasa-flow",
    title: "ヴィンヤサフロー シークエンス設計術",
    description:
      "テーマ設定からピークポーズへの導線まで、心地よい流れを作るクラス設計の考え方です。",
    category: "クラス設計",
    level: "中級",
    durationMinutes: 60,
    priceJpy: 4500,
    membersOnly: false,
  },
  {
    slug: "restorative-yoga-props",
    title: "リストラティブヨガとプロップスの使い方",
    description:
      "ボルスターやブロックを使い、心身をゆるめるリストラティブクラスの組み立て方を紹介します。",
    category: "専門コース",
    level: "初級〜中級",
    durationMinutes: 50,
    priceJpy: 3900,
    membersOnly: false,
  },
  {
    slug: "yoga-anatomy-hip-joint",
    title: "股関節の機能解剖と可動域アプローチ",
    description:
      "股関節周りの構造を理解し、生徒一人ひとりに合わせた無理のないポーズ調整を学びます。",
    category: "基礎解剖学",
    level: "中級",
    durationMinutes: 45,
    priceJpy: 4200,
    membersOnly: true,
  },
  {
    slug: "breathwork-pranayama",
    title: "プラナヤマ(呼吸法)指導の基礎",
    description:
      "代表的な呼吸法の効果と手順、クラスでの導入タイミングについて実演しながら解説します。",
    category: "専門コース",
    level: "初級",
    durationMinutes: 38,
    priceJpy: 3300,
    membersOnly: false,
  },
  {
    slug: "class-branding-for-teachers",
    title: "選ばれるヨガインストラクターのブランディング",
    description:
      "SNS発信や体験レッスンの設計など、指導以外に必要なビジネス視点をまとめました。",
    category: "キャリア",
    level: "全レベル",
    durationMinutes: 52,
    priceJpy: 3600,
    membersOnly: false,
  },
  {
    slug: "yin-yoga-fundamentals",
    title: "陰ヨガ(Yin Yoga)の基礎理論と実践",
    description:
      "筋膜や結合組織へのアプローチを中心に、陰ヨガならではのホールドの意図を解説します。",
    category: "専門コース",
    level: "中級",
    durationMinutes: 58,
    priceJpy: 4500,
    membersOnly: true,
  },
  {
    slug: "kids-yoga-teaching",
    title: "キッズヨガクラスの作り方",
    description:
      "集中力が続きにくい子どもたちを飽きさせない、遊びを取り入れたクラス構成のコツです。",
    category: "専門コース",
    level: "初級",
    durationMinutes: 40,
    priceJpy: 3500,
    membersOnly: false,
  },
  {
    slug: "injury-prevention-common-mistakes",
    title: "よくある怪我とその予防策",
    description:
      "腰・膝・肩関節に負担がかかりやすい代表的なポーズと、予防のための代替ポーズを紹介します。",
    category: "基礎解剖学",
    level: "中級",
    durationMinutes: 47,
    priceJpy: 4200,
    membersOnly: true,
  },
  {
    slug: "meditation-guided-scripting",
    title: "ガイド瞑想スクリプトの作り方",
    description:
      "クラスの最後に行う瞑想パートを、自分の言葉でスムーズに導けるようになる実践講座です。",
    category: "指導スキル",
    level: "初級〜中級",
    durationMinutes: 35,
    priceJpy: 2900,
    membersOnly: false,
  },
];

const plans = [
  {
    key: "single",
    name: "都度購入",
    priceJpy: 0,
    interval: "SINGLE",
    description: "気になる講座だけを単品で購入できます。",
    features: JSON.stringify([
      "購入した動画は永続的に視聴可能",
      "PC・スマホ・タブレット対応",
      "会員登録なしでも購入可能",
    ]),
  },
  {
    key: "monthly",
    name: "マンスリー会員",
    priceJpy: 4980,
    interval: "MONTH",
    description: "会員限定動画を含む全講座が見放題の月額プランです。",
    features: JSON.stringify([
      "会員限定動画を含む全講座が見放題",
      "毎月追加される新作講座もすぐに視聴可能",
      "いつでも解約可能",
    ]),
  },
  {
    key: "yearly",
    name: "イヤリー会員",
    priceJpy: 49800,
    interval: "YEAR",
    description: "2ヶ月分お得な年額プラン。じっくり学びたい方向け。",
    features: JSON.stringify([
      "マンスリー会員の内容をすべて含む",
      "月額換算で2ヶ月分お得",
      "優先サポート対応",
    ]),
  },
];

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      update: plan,
      create: plan,
    });
  }

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const [gradientFrom, gradientTo] = gradients[i % gradients.length];
    await prisma.video.upsert({
      where: { slug: video.slug },
      update: { ...video, gradientFrom, gradientTo, videoUrl: SAMPLE_VIDEO_URL },
      create: { ...video, gradientFrom, gradientTo, videoUrl: SAMPLE_VIDEO_URL },
    });
  }

  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@yoga-studio.example.com" },
    update: {},
    create: {
      name: "スタジオ管理者",
      email: "admin@yoga-studio.example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const demoPasswordHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.upsert({
    where: { email: "demo@yoga-studio.example.com" },
    update: {},
    create: {
      name: "デモユーザー",
      email: "demo@yoga-studio.example.com",
      passwordHash: demoPasswordHash,
      role: "USER",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
