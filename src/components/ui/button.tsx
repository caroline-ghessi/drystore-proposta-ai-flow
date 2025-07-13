import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Botão Primário - Conforme Manual Drystore (pill shape)
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-card hover:shadow-hover",
        // Botão Secundário - Transparente com borda (pill shape)
        secondary: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-full",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-full",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-md",
        link: "text-primary underline-offset-4 hover:underline",
        // Botões específicos para submarcas
        drysolar: "bg-drysolar text-drysolar-foreground hover:bg-drysolar/90 rounded-full shadow-card",
        "drysolar-outline": "border-2 border-drysolar bg-transparent text-drysolar hover:bg-drysolar hover:text-drysolar-foreground rounded-full",
        drybuild: "bg-drybuild text-drybuild-foreground hover:bg-drybuild/90 rounded-full shadow-card",
        "drybuild-outline": "border-2 border-drybuild bg-transparent text-drybuild hover:bg-drybuild hover:text-drybuild-foreground rounded-full",
        drytools: "bg-drytools text-drytools-foreground hover:bg-drytools/90 rounded-full shadow-card",
        "drytools-outline": "border-2 border-drytools bg-transparent text-drytools hover:bg-drytools hover:text-drytools-foreground rounded-full",
        // Botões especiais
        hero: "bg-gradient-primary text-white shadow-glow hover:shadow-hover rounded-full",
        premium: "bg-gradient-hero text-white shadow-elegant hover:scale-105 rounded-full",
        success: "bg-success text-success-foreground hover:bg-success/90 rounded-full",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 rounded-full",
      },
      size: {
        default: "h-10 px-8 py-2",
        sm: "h-8 px-6 text-sm",
        lg: "h-12 px-10 text-base",
        xl: "h-14 px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
