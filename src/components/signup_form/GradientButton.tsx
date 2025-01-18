import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from 'lucide-react'

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  isLoading?: boolean
}

export function GradientButton({ children, className, isLoading, disabled, ...props }: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-white hover:opacity-90 transition-opacity",
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Chargement...
        </>
      ) : (
        children
      )}
    </Button>
  )
}

