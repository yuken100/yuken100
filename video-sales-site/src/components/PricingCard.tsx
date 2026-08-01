import PlanSubscribeButton from "@/components/PlanSubscribeButton";

type PricingCardProps = {
  name: string;
  priceJpy: number;
  interval: "SINGLE" | "MONTH" | "YEAR";
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaHref: string;
  ctaLabel: string;
  planKey?: string;
};

const intervalLabel: Record<PricingCardProps["interval"], string> = {
  SINGLE: "",
  MONTH: " / 月",
  YEAR: " / 年",
};

export default function PricingCard({
  name,
  priceJpy,
  interval,
  description,
  features,
  highlighted,
  ctaHref,
  ctaLabel,
  planKey,
}: PricingCardProps) {
  const ctaClassName = `mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
    highlighted
      ? "bg-white text-tiffany-700 hover:bg-tiffany-50"
      : "bg-tiffany-500 text-white hover:bg-tiffany-600"
  }`;

  return (
    <div
      className={`flex flex-col rounded-xl2 border p-8 shadow-sm ${
        highlighted
          ? "border-tiffany-400 bg-tiffany-500 text-white shadow-soft"
          : "border-tiffany-100 bg-white text-tiffany-900"
      }`}
    >
      <p className={`font-display text-lg font-bold ${highlighted ? "text-white" : "text-tiffany-800"}`}>
        {name}
      </p>
      <p className={`mt-3 text-3xl font-bold ${highlighted ? "text-white" : "text-tiffany-900"}`}>
        {priceJpy === 0 ? "都度払い" : `¥${priceJpy.toLocaleString()}`}
        <span className="text-base font-medium">{intervalLabel[interval]}</span>
      </p>
      <p className={`mt-3 text-sm ${highlighted ? "text-white/90" : "text-tiffany-800/70"}`}>
        {description}
      </p>
      <ul className="mt-6 flex-1 space-y-2 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className={highlighted ? "text-white" : "text-tiffany-500"}>✓</span>
            <span className={highlighted ? "text-white/90" : "text-tiffany-800/80"}>{feature}</span>
          </li>
        ))}
      </ul>
      {planKey ? (
        <PlanSubscribeButton planKey={planKey} label={ctaLabel} className={ctaClassName} />
      ) : (
        <a href={ctaHref} className={ctaClassName}>
          {ctaLabel}
        </a>
      )}
    </div>
  );
}
