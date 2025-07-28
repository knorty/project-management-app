import * as React from "react"
import { cn } from "@/lib/utils"

const Timeline = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
    />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        variant?: "default" | "success" | "warning" | "error"
    }
>(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex gap-4 pb-8 last:pb-0",
            className
        )}
        {...props}
    />
))
TimelineItem.displayName = "TimelineItem"

const TimelineDot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        variant?: "default" | "success" | "warning" | "error"
    }
>(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-background",
            {
                "bg-primary": variant === "default",
                "bg-green-500": variant === "success",
                "bg-yellow-500": variant === "warning",
                "bg-red-500": variant === "error",
            },
            className
        )}
        {...props}
    />
))
TimelineDot.displayName = "TimelineDot"

const TimelineContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex-1 space-y-1", className)}
        {...props}
    />
))
TimelineContent.displayName = "TimelineContent"

const TimelineTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h4
        ref={ref}
        className={cn("font-medium leading-none", className)}
        {...props}
    />
))
TimelineTitle.displayName = "TimelineTitle"

const TimelineDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
TimelineDescription.displayName = "TimelineDescription"

const TimelineTime = React.forwardRef<
    HTMLTimeElement,
    React.HTMLAttributes<HTMLTimeElement>
>(({ className, ...props }, ref) => (
    <time
        ref={ref}
        className={cn("text-xs text-muted-foreground", className)}
        {...props}
    />
))
TimelineTime.displayName = "TimelineTime"

export {
    Timeline,
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTitle,
    TimelineDescription,
    TimelineTime,
} 