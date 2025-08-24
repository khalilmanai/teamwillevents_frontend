import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium theme-transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: cn(
          // Light and Eco+ Light: filled style
          "light:bg-primary light:text-primary-foreground light:shadow-sm light:hover:bg-primary/90",
          "ecoplus:bg-primary ecoplus:text-primary-foreground ecoplus:shadow-sm ecoplus:hover:bg-primary/90",
          // Dark and Eco+ Dark: outline style
          "dark:bg-transparent dark:text-foreground dark:border-2 dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground",
          "ecoplus-dark:bg-transparent ecoplus-dark:text-foreground ecoplus-dark:border-2 ecoplus-dark:border-border ecoplus-dark:hover:bg-accent ecoplus-dark:hover:text-accent-foreground"
        ),
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "bg-transparent border-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost:
          "bg-transparent hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline bg-transparent",
        filled:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
