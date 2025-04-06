"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const tabsVariants = {
  default: "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1",
  futuristic: "inline-flex h-12 items-center justify-center rounded-md bg-muted/30 p-1 backdrop-blur-sm border border-primary/20 shadow-glow-primary",
  glass: "inline-flex h-12 items-center justify-center rounded-md bg-muted/20 p-1 backdrop-blur-md border border-white/20",
  glowing: "inline-flex h-12 items-center justify-center rounded-md bg-muted/30 p-1 backdrop-blur-sm border border-primary/30 animate-border-glow"
}

const tabsTriggerVariants = {
  default: "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
  futuristic: "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background/80 data-[state=active]:text-foreground data-[state=active]:shadow-glow-primary data-[state=active]:backdrop-blur-sm hover:bg-background/50 hover:-translate-y-0.5 duration-300",
  glass: "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background/40 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-md hover:bg-background/30 hover:-translate-y-0.5 duration-300",
  glowing: "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background/60 data-[state=active]:text-foreground data-[state=active]:shadow-glow-primary data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:backdrop-blur-sm hover:bg-background/40 hover:-translate-y-0.5 duration-300"
}

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: keyof typeof tabsVariants;
  triggerVariant?: keyof typeof tabsTriggerVariants;
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { variant?: keyof typeof tabsVariants }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      tabsVariants[variant],
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { variant?: keyof typeof tabsTriggerVariants }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      tabsTriggerVariants[variant],
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
