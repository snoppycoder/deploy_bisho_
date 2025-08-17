import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, LockKeyhole } from "lucide-react" // 👈 nice icons

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === "password"

  return (
    <div className="relative w-full">
     
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <LockKeyhole className="h-4 w-4 text-slate-400" />
      </div>

      <input
        type={isPassword && showPassword ? "text" : type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 text-base py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  )
})
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
