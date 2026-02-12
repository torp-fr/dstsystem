import * as React from "react"
import { Textarea } from "@/components/ui/textarea"

export interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  customizable?: boolean
}

const CustomTextarea = React.forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ className, label, description, customizable = true, ...props }, ref) => {
    const baseClass = className || ""

    if (customizable) {
      return (
        <div className="space-y-1">
          {label && <label className="text-sm font-medium">{label}</label>}
          <Textarea
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
        <Textarea ref={ref} className={baseClass} {...props} />
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    )
  }
)
CustomTextarea.displayName = "CustomTextarea"

export { CustomTextarea }
