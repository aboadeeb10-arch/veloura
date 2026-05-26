import { prisma } from "@/lib/prisma";

/** All data for the homepage. Resilient: returns empty arrays if the DB is
 *  unreachable so the page still renders. */
export async function getHomeData() {
  try {
    const [heroSlides, stories, workItems, treatments, products] =
      await Promise.all([
        prisma.heroSlide.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.story.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.workGalleryItem.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          take: 6,
        }),
        prisma.service.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { practitioner: true },
          take: 6,
        }),
        prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          include: { category: true, variants: { select: { stock: true } } },
          take: 6,
        }),
      ]);
    return { heroSlides, stories, workItems, treatments, products };
  } catch {
    return {
      heroSlides: [],
      stories: [],
      workItems: [],
      treatments: [],
      products: [],
    };
  }
}

/** Convert a Prisma Decimal (or number) to a plain number. */
export function num(value: unknown): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}
