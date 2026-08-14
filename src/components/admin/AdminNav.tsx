"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/primitives/Button";
import type { AdminSession } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/auth-client";
import { cn } from "@/lib/utils";

/** seules les routes qui EXISTENT : un lien mort dans un outil de travail est pire qu'un menu court */
const LINKS: { href: string; label: string }[] = [
  { href: "/admin", label: "tableau de bord" },
  { href: "/admin/content", label: "contenu" },
  { href: "/admin/messages", label: "traductions" },
];

interface AdminNavProps {
  session: AdminSession;
}

export const AdminNav = ({ session }: AdminNavProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin/signin");
  };

  return (
    <header className="screen-line-after flex flex-col gap-y-3 border-edge border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex flex-wrap items-center gap-x-4">
        {LINKS.map((link) => {
          // `/admin` ne doit pas s'allumer sur `/admin/content` : seul le
          // préfixe exact compte pour la racine
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              className={cn(
                "text-sm lowercase transition-colors",
                isActive
                  ? "text-theme underline decoration-dotted underline-offset-4"
                  : "text-muted-foreground hover:text-foreground"
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-x-3">
        <span className="text-muted-foreground text-xs">
          {session.githubLogin ?? session.name ?? "connecté"}
        </span>

        <Button onClick={handleSignOut} variant="outline">
          se déconnecter
        </Button>
      </div>
    </header>
  );
};
