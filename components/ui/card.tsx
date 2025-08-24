import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, variant = "adaptive", ...props }: React.ComponentProps<"div"> & {
  variant?: "adaptive" | "filled" | "outline"
}) {
  const getCardClasses = () => {
    switch (variant) {
      case "filled":
        return "bg-card text-card-foreground border shadow-sm";
      case "outline":
        return "bg-transparent text-foreground border-2 shadow-none";
      case "adaptive":
      default:
        return cn(
          "theme-transition",
          // Light and Eco+ Light: filled style
          "light:bg-card light:text-card-foreground light:border light:shadow-sm",
          "ecoplus:bg-card ecoplus:text-card-foreground ecoplus:border ecoplus:shadow-sm",
          // Dark and Eco+ Dark: outline style
          "dark:bg-transparent dark:text-foreground dark:border-2 dark:shadow-none",
          "ecoplus-dark:bg-transparent ecoplus-dark:text-foreground ecoplus-dark:border-2 ecoplus-dark:shadow-none"
        );
    }
  };

  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-xl py-6",
        getCardClasses(),
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
