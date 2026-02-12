import * as React from "react"
import { Input } from "@/components/ui/input"

export interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  customizable?: boolean
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, label, description, customizable = true, ...props }, ref) => {
    const baseClass = className || ""

    if (customizable) {
      return (
        <div className="space-y-1">
          {label && <label className="text-sm font-medium">{label}</label>}
          <Input
            ref={ref}
            className={`${baseClass} border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all`}
            {...props}
          />
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )
    }

    return (
      <div className="space-y-1">
        {label && <label className="text-sm font-medium">{label}</label>}
        <Input ref={ref} className={baseClass} {...props} />
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    )
  }
)
CustomInput.displayName = "CustomInput"

export { CustomInput }
