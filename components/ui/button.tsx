import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5',
        destructive: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-200',
        outline: 'border-2 border-purple-200 bg-white hover:bg-purple-50 text-purple-700',
        secondary: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
        ghost: 'hover:bg-purple-50 text-gray-600 hover:text-purple-700',
        link: 'text-violet-600 underline-offset-4 hover:underline',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-200',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
