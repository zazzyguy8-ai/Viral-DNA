"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dna,
  Lightbulb,
  Users2,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Zap },
  { href: "/dashboard/viral-dna", label: "Viral DNA", icon: Dna },
  { href: "/dashboard/ideas", label: "Idea Engine", icon: Lightbulb },
  { href: "/dashboard/competitors", label: "Competitor DNA", icon: Users2 },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-56 flex flex-col border-r border-[#E4E4E7] bg-white z-30">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#E4E4E7]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
            <Dna className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight gradient-text">Viral DNA</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-[#EDE9FE] text-[#5B21B6]"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F4F5]"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#6D28D9]" : "")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[#E4E4E7]">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-[#EDE9FE] text-[#5B21B6]"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F4F5]"
          )}
        >
          <Settings className={cn("h-4 w-4 shrink-0", pathname === "/dashboard/settings" ? "text-[#6D28D9]" : "")} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
