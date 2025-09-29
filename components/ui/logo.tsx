import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const logoVariants = cva("flex items-center gap-2", {
  variants: {
    variant: {
      default: "text-foreground",
      subtle: "text-muted-foreground",
    },
    size: {
      sm: "text-sm [&>img]:h-16 [&>img]:w-16",
      md: "text-base [&>img]:h-22 [&>img]:w-22",
      lg: "text-lg [&>img]:h-35 [&>img]:w-35",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

export interface LogoProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof logoVariants> {
  src?: string
  alt?: string
}

function Logo({
  className,
  src,
  alt = "Logo",
  variant,
  size,
  ...props
}: LogoProps) {
  return (
    <div className={cn(logoVariants({ variant, size }), className)} {...props}>
      {src && <img src={src} alt={alt} className="object-contain" />}
      <div className="flex flex-col">
        <LogoTitle />
        <LogoSubtitle />
      </div>
    </div>
  )
}

function LogoTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="logo-title"
      className={cn("font-bold tracking-tight", className)}
      {...props}
    />
  )
}

function LogoSubtitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="logo-subtitle"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Logo, LogoTitle, LogoSubtitle }
