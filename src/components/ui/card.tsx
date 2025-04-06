import * as React from "react"

import { cn } from "@/lib/utils"

const cardVariants = {
  default: "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
  futuristic: "bg-card/80 text-card-foreground flex flex-col gap-6 rounded-xl border border-primary/20 py-6 shadow-glow-primary backdrop-blur-sm transition-all duration-300 hover:shadow-glow-accent",
  glass: "bg-card/40 text-card-foreground flex flex-col gap-6 rounded-xl border border-white/20 py-6 shadow-sm backdrop-blur-md transition-all duration-300",
  glowing: "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-primary/30 py-6 shadow-glow-primary animate-border-glow backdrop-blur-sm"
}

interface CardProps extends React.ComponentProps<"div"> {
  variant?: keyof typeof cardVariants
}

function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        cardVariants[variant],
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
      className={cn("leading-none font-semibold text-xl", className)}
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
