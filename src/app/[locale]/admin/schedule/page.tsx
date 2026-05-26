import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { ScheduleEditor } from "@/components/admin/schedule-editor";

export const dynamic = "force-dynamic";

const PRACTITIONER_INCLUDE = {
  clinics: { include: { clinic: true } },
  workingHours: true,
} as const;

async function getPractitioners(editorUserId?: string) {
  if (editorUserId) {
    const p = await prisma.practitioner.findUnique({
      where: { userId: editorUserId },
      include: PRACTITIONER_INCLUDE,
    });
    return p ? [p] : [];
  }
  return prisma.practitioner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: PRACTITIONER_INCLUDE,
  });
}

export default async function AdminSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const session = await auth();
  const editorId =
    session?.user?.role === "EDITOR" ? session.user.id : undefined;
  const practitioners = await getPractitioners(editorId);

  return (
    <div>
      <h1 className="mb-2 text-2xl text-ink">{t("schedule")}</h1>
      <p className="mb-6 text-sm text-ink-soft">{t("scheduleIntro")}</p>
      <div className="space-y-5">
        {practitioners.flatMap((p) =>
          p.clinics.map((pc) => {
            const hours = p.workingHours
              .filter((h) => h.clinicId === pc.clinicId)
              .map((h) => ({
                dayOfWeek: h.dayOfWeek,
                startTime: h.startTime,
                endTime: h.endTime,
              }));
            return (
              <ScheduleEditor
                key={`${p.id}-${pc.clinicId}`}
                practitionerId={p.id}
                clinicId={pc.clinicId}
                title={`${p.name} — ${pick(pc.clinic.name, locale)}`}
                initialHours={hours}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
