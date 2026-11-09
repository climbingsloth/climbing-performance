"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Tableau de bord", icon: "📊" },
  { href: "/athletes", label: "Athlètes", icon: "👥" },
  { href: "/mensurations", label: "Mensurations", icon: "📏" },
  { href: "/bien-etre", label: "Bien-être", icon: "😴" },
  { href: "/resultats", label: "Résultats", icon: "🏆" },
  { href: "/tests", label: "Tests", icon: "🧪" },
  { href: "/planning", label: "Planning", icon: "📅" },
];

function MenuItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {links.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center gap-2 bg-sidebar px-4 py-3 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-md p-2 text-white hover:bg-white/10"
        >
          ☰
        </button>
        <span className="text-sm font-bold text-white">Climbing Performance</span>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <span className="text-xl" aria-hidden>
            🧗
          </span>
          <span className="text-base font-bold text-white">
            Climbing Performance
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <MenuItems onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Coach
          </p>
          <p className="mt-1 text-sm font-medium text-white">Mon compte</p>
        </div>
      </aside>
    </>
  );
}
