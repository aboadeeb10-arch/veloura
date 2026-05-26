export function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-line bg-cream-100">
      <div className="container-wide py-12 text-center sm:py-16">
        <span className="mx-auto mb-4 block h-px w-12 bg-gold" />
        <h1 className="text-3xl text-ink sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
