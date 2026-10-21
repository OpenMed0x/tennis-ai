"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; group: number };

// side：左边栏竖排；pills：手机顶部横向滑动
export default function NavLinks({ links, variant }: { links: NavItem[]; variant: "side" | "pills" }) {
  const path = usePathname();
  const isActive = (h: string) => path === h || path.startsWith(h + "/");

  if (variant === "pills") {
    return (
      <>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(l.href) ? "page" : undefined}
            className={`flex h-10 shrink-0 items-center rounded-full border px-4 text-sm ${
              isActive(l.href) ? "border-white bg-white font-semibold" : "border-ink/20 text-ink/80"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </>
    );
  }

  return (
    <ul className="space-y-1">
      {links.map((l, i) => (
        <li key={l.href} className={i > 0 && links[i - 1].group !== l.group ? "mt-3 border-t border-ink/15 pt-3" : ""}>
          <Link
            href={l.href}
            aria-current={isActive(l.href) ? "page" : undefined}
            className={`flex h-10 items-center rounded-md px-3 text-sm transition-colors ${
  isActive(l.href)
    ? "bg-gray-100 font-semibold text-gray-950"
    : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
}`}
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
