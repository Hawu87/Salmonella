"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/biology", label: "Biology" },
  { href: "/visualizations", label: "Visualizations" },
  { href: "/references", label: "References" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#E5E7EB]">
      <nav
        className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-4"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-lg font-semibold text-[#111827] hover:text-[#0F766E]"
        >
          Salmonella Research
        </Link>
        <ul className="flex flex-wrap items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-[#0F766E] text-[#111827]"
                      : "border-transparent text-[#6B7280] hover:text-[#111827]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
