"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  variant = "adaptive",
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  variant?: "adaptive" | "filled" | "outline"
}) {
  const getPopoverClasses = () => {
    switch (variant) {
      case "filled":
        return "bg-popover text-popover-foreground border shadow-md";
      case "outline":
        return "bg-transparent text-foreground border-2 shadow-none";
      case "adaptive":
      default:
        return cn(
          "theme-transition",
          // Light and Eco+ Light: filled style
          "light:bg-popover light:text-popover-foreground light:border light:shadow-md",
          "ecoplus:bg-popover ecoplus:text-popover-foreground ecoplus:border ecoplus:shadow-md",
          // Dark and Eco+ Dark: outline style
          "dark:bg-transparent dark:text-foreground dark:border-2 dark:shadow-none",
          "ecoplus-dark:bg-transparent ecoplus-dark:text-foreground ecoplus-dark:border-2 ecoplus-dark:shadow-none"
        );
    }
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md p-4 outline-hidden",
          getPopoverClasses(),
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
