import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface CustomSelectProps {
  label?: string
  description?: string
  customizable?: boolean
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children?: React.ReactNode
}

const CustomSelect = React.forwardRef<HTMLButtonElement, CustomSelectProps>(
  ({ label, description, customizable = true, children, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="text-sm font-medium">{label}</label>}
        <Select {...props}>
          <SelectTrigger
            ref={ref}
            className={customizable ? "border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all" : ""}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    )
  }
)
CustomSelect.displayName = "CustomSelect"

export { CustomSelect }
