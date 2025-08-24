"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Leaf, TreePine, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="flex items-center gap-2 opacity-50">
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
      </Button>
    );
  }

  const themes: {
    value: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    category: 'standard' | 'eco';
  }[] = [
    {
      value: "light",
      label: "Light",
      icon: <Sun className="h-4 w-4" />,
      description: "Bright filled backgrounds",
      category: 'standard'
    },
    {
      value: "dark",
      label: "Dark",
      icon: <Moon className="h-4 w-4" />,
      description: "Dark with outline style",
      category: 'standard'
    },
    {
      value: "ecoplus",
      label: "Eco+ Light",
      icon: <Leaf className="h-4 w-4" />,
      description: "Nature-inspired filled",
      category: 'eco'
    },
    {
      value: "ecoplus-dark",
      label: "Eco+ Dark",
      icon: <TreePine className="h-4 w-4" />,
      description: "Minimal nature outline",
      category: 'eco'
    },
  ];

  const current = themes.find((t) => t.value === theme) || themes[0];

  const handleThemeChange = (value: string) => {
    // Add smooth transition class to html
    document.documentElement.classList.add('theme-transitioning');
    
    // Set the theme (next-themes handles the class management)
    setTheme(value);
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  };

  const standardThemes = themes.filter(t => t.category === 'standard');
  const ecoThemes = themes.filter(t => t.category === 'eco');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2 theme-transition",
            "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {current.icon}
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "w-56 theme-adaptive-popover",
          "animate-in fade-in-0 zoom-in-95"
        )}
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Standard Themes</p>
        </div>
        {standardThemes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => handleThemeChange(t.value)}
            className={cn(
              "flex items-center justify-between cursor-pointer theme-transition",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              {t.icon}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.description}</span>
              </div>
            </div>
            {theme === t.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Eco+ Themes</p>
        </div>
        {ecoThemes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => handleThemeChange(t.value)}
            className={cn(
              "flex items-center justify-between cursor-pointer theme-transition",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              {t.icon}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.description}</span>
              </div>
            </div>
            {theme === t.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
