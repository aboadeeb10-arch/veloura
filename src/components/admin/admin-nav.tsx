"use client";

import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  CalendarCheck,
  ShoppingBag,
  Package,
  Clock,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, roles: ["ADMIN", "EDITOR"] },
  { key: "bookings", href: "/admin/bookings", icon: CalendarCheck, roles: ["ADMIN", "EDITOR"] },
  { key: "orders", href: "/admin/orders", icon: ShoppingBag, roles: ["ADMIN"] },
  { key: "products", href: "/admin/products", icon: Package, roles: ["ADMIN", "EDITOR"] },
  { key: "schedule", href: "/admin/schedule", icon: Clock, roles: ["ADMIN", "EDITOR"] },
] as const;

export function AdminNav({ role }: { role: string }) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const links = LINKS.filter((l) => l.roles.includes(role as never));

  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-2 lg:flex-col">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.key}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gold text-white"
                : "text-ink-soft hover:bg-cream-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
