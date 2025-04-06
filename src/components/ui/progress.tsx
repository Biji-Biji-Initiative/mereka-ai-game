"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const progressVariants = {
  default: "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
  futuristic: "relative h-4 w-full overflow-hidden rounded-full bg-secondary/30 backdrop-blur-sm border border-primary/20 shadow-glow-primary",
  glowing: "relative h-4 w-full overflow-hidden rounded-full bg-secondary/20 backdrop-blur-sm border border-primary/30 animate-border-glow",
  glass: "relative h-4 w-full overflow-hidden rounded-full bg-secondary/20 backdrop-blur-md border border-white/20"
}

const indicatorVariants = {
  default: "h-full w-full flex-1 bg-primary transition-all",
  futuristic: "h-full w-full flex-1 bg-gradient-primary transition-all animate-background-pan bg-[length:200%_100%]",
  glowing: "h-full w-full flex-1 bg-primary transition-all shadow-glow-primary",
  animated: "h-full w-full flex-1 progress-futuristic transition-all"
}

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  variant?: keyof typeof progressVariants;
  indicatorVariant?: keyof typeof indicatorVariants;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value, 
  indicatorClassName, 
  variant = "default",
  indicatorVariant = "default",
  ...props 
}, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      progressVariants[variant],
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        indicatorVariants[indicatorVariant],
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
