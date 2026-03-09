import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectDemoProps = {
    months: string[];
    onMonthSelect: (month: string) => void;
  };
  

  export function SelectDemo({ months, onMonthSelect }: SelectDemoProps) {
    return (
      <Select onValueChange={(value) => onMonthSelect(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a month" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Months</SelectLabel>
            {(months || []).map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }