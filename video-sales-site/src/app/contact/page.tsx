import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-tiffany-900">お問い合わせ</h1>
      <p className="mt-2 text-sm text-tiffany-800/70">
        講座やレッスンについてのご質問など、お気軽にお問い合わせください。
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
