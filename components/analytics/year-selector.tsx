"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface YearSelectorProps {
  value: number
  onChange: (year: number) => void
  startYear?: number
  endYear?: number
}

export function YearSelector({
  value,
  onChange,
  startYear = 2020,
  endYear = new Date().getFullYear() + 1,
}: YearSelectorProps) {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i)

  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="year-select" className="font-semibold text-sm">
        Select Year:
      </Label>
      <Select value={value.toString()} onValueChange={(val) => onChange(Number(val))}>
        <SelectTrigger id="year-select" className="w-32">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
