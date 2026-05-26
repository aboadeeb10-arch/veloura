import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream-50 px-6 text-center">
      <p className="heading-eyebrow mb-3">404</p>
      <h1 className="text-3xl font-medium text-ink">Page not found</h1>
      <Link
        href="/"
        className="mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gold-dark"
      >
        Back to Veloura
      </Link>
    </main>
  );
}
