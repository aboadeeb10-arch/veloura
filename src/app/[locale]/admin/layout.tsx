import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    redirect("/account");
  }

  return (
    <main className="min-h-[80vh] bg-cream-50">
      <div className="container-wide flex flex-col gap-6 py-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <AdminNav role={session.user.role} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
