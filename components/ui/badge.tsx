import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-none border border-dashed px-2 py-0.5 font-mono text-xs uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white text-[#1a4d7a] border-white [a&]:hover:bg-white/90",
        secondary:
          "bg-white/10 text-white border-white/40 [a&]:hover:bg-white/20",
        destructive:
          "bg-destructive text-white border-transparent [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "bg-transparent text-white border-white/40 [a&]:hover:bg-white/10",
        ghost: "bg-transparent text-white border-transparent [a&]:hover:bg-white/10",
        link: "bg-transparent text-white border-transparent underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
