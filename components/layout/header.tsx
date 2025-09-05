"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/lib/i18n";
import type { User as UserType } from "@/lib/types";
import type { Role } from "@/lib/roles";
import { roleRoutes } from "@/lib/roles";
import Image from "next/image";
import { NotificationsDropdown } from "../notifications/notification-dropdown";
import ThemeSwitcher from "@/components/ui/theme-switcher";

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navigation =
    user.role === "manager"
      ? [
          { name: t("navigation.dashboard"), href: roleRoutes.manager.dashboard },
          { name: t("navigation.createEvent"), href: roleRoutes.manager.createEvent },
          { name: t("navigation.draft"), href: roleRoutes.manager.draft },
          { name: t("navigation.tasks"), href: roleRoutes.manager.tasks },
          { name: t("navigation.analytics"), href: roleRoutes.manager.analytics },
        ]
      : [
          { name: t("navigation.events"), href: roleRoutes.employee.dashboard },
          { name: t("navigation.myRegistrations"), href: roleRoutes.employee.registrations },
          { name: t("navigation.tasks"), href: roleRoutes.employee.tasks },
        ];

  const profileHref = roleRoutes[user.role as Role]?.profile || "/profile";

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${
            pathname === item.href
              ? "theme-text-primary border-b-2 border-[var(--primary)]"
              : "theme-text-muted hover:theme-text-foreground"
          } ${mobile ? "block py-2" : "px-3 py-2"} text-sm font-medium theme-transition`}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full theme-border border-b theme-bg-card/95 backdrop-blur supports-[backdrop-filter]:theme-bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-teamwill.png"
              alt="Teamwill Logo"
              width={36}
              height={36}
              style={{ objectFit: "contain" }}
            />
            <span className="font-bold text-xl theme-text-primary">TeamwillEvents</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <NavLinks />
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full theme-transition">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.username} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 theme-adaptive-popover rounded-[--radius-lg]" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium theme-text-foreground">{user.username}</p>
                  <p className="text-xs theme-text-muted">{user.email}</p>
                  <Badge
                    variant={user.role === "manager" ? "default" : "secondary"}
                    className="w-fit theme-transition"
                  >
                    {user.role === "manager" ? t("auth.manager") : t("auth.employee")}
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator className="theme-bg-muted" />
              <DropdownMenuItem asChild className="theme-transition">
                <Link href={profileHref}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("navigation.profile")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="theme-transition">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("navigation.settings")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="theme-bg-muted" />
              <DropdownMenuItem onClick={onLogout} className="theme-transition">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("auth.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden theme-transition">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] theme-adaptive-dialog">
              <nav className="flex flex-col space-y-4 mt-4">
                <NavLinks mobile />
                <Link
                  href={profileHref}
                  className="block py-2 text-sm font-medium theme-text-muted hover:theme-text-foreground theme-transition"
                >
                  {t("navigation.profile")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}