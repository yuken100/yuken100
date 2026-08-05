type TestimonialItem = {
  id: string;
  studentName: string;
  comment: string;
  photoUrl: string | null;
  photoPosition: string;
  rating: number | null;
};

export default function TestimonialSection({
  testimonials,
  title = "生徒さんの声",
}: {
  testimonials: TestimonialItem[];
  title?: string;
}) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-tiffany-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center font-display text-2xl font-bold text-tiffany-900">{title}</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="rounded-xl2 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                {testimonial.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={testimonial.photoUrl}
                    alt={testimonial.studentName}
                    className="h-10 w-10 rounded-full object-cover"
                    style={{ objectPosition: testimonial.photoPosition ?? "50% 50%" }}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tiffany-200 text-sm font-bold text-white">
                    {testimonial.studentName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-tiffany-900">{testimonial.studentName}</p>
                  {testimonial.rating && (
                    <p className="text-xs text-tiffany-500" aria-label={`評価${testimonial.rating}`}>
                      {"★".repeat(testimonial.rating)}
                      {"☆".repeat(5 - testimonial.rating)}
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-tiffany-800/80">
                {testimonial.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
