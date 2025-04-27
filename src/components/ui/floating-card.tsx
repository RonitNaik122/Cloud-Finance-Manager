import * as React from "react"
import { cn } from "@/lib/utils"

const FloatingCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      className
    )}
    {...props}
  />
))
FloatingCard.displayName = "FloatingCard"

export { FloatingCard } 