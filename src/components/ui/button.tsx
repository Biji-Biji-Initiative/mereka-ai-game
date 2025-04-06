import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow-primary hover:bg-primary/90 hover:shadow-glow-accent transition-all duration-300 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 transition-all duration-300 hover:-translate-y-0.5",
        outline:
          "border bg-background/80 backdrop-blur-sm shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input/80 dark:hover:bg-input/50 border-primary/30 hover:border-primary transition-all duration-300 hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 transition-all duration-300 hover:-translate-y-0.5",
        ghost:
          "hover:bg-accent/30 hover:text-accent-foreground dark:hover:bg-accent/30 backdrop-blur-sm transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-300",
        futuristic: 
          "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow-primary hover:shadow-glow-accent transition-all duration-300 hover:-translate-y-1 border border-primary/20 backdrop-blur-sm",
        glowing:
          "bg-background/80 border border-primary/50 text-primary shadow-glow-primary hover:shadow-glow-accent animate-pulse-slow transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm",
        glass:
          "bg-background/40 backdrop-blur-md border border-white/20 text-foreground hover:bg-background/60 transition-all duration-300 hover:-translate-y-0.5",
        holographic:
          "relative overflow-hidden bg-background/30 backdrop-blur-md border border-white/30 text-foreground transition-all duration-300 hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-holographic-gradient before:bg-[length:200%_200%] before:animate-holographic-shift before:opacity-30 before:z-0 [&>*]:relative [&>*]:z-10",
        neon:
          "bg-background/20 border border-primary text-foreground neon-border transition-all duration-300 hover:-translate-y-0.5 hover:neon-text",
        cyber:
          "bg-background/80 border-l-4 border-primary text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-accent cyberpunk-grid",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-8 has-[>svg]:px-5 text-base",
        xl: "h-14 rounded-md px-10 has-[>svg]:px-6 text-lg",
        icon: "size-10",
        pill: "h-10 px-6 rounded-full",
        "pill-sm": "h-8 px-4 rounded-full text-xs",
        "pill-lg": "h-12 px-8 rounded-full text-base",
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
