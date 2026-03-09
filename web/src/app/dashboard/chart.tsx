"use client"
import { useState } from "react";
import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { SelectDemo } from "./select"
export const description = "A line chart with a label"

const chartData = [
  // January payments
  { date: "2025-01-01", moneySpent: 100 },
  { date: "2025-01-10", moneySpent: 80 },
  { date: "2025-01-15", moneySpent: 86 },
  // February payments
  { date: "2025-02-01", moneySpent: 200 },
  { date: "2025-02-10", moneySpent: 150 },
  { date: "2025-02-20", moneySpent: 155 },
  // March payments
  { date: "2025-03-01", moneySpent: 120 },
  { date: "2025-03-12", moneySpent: 137 },
  { date: "2025-03-25", moneySpent: 100 },
  // April payments
  { date: "2025-04-01", moneySpent: 63 },
  { date: "2025-04-18", moneySpent: 200 },
  // May payments
  { date: "2025-05-01", moneySpent: 139 },
  { date: "2025-05-15", moneySpent: 200 },
  // June payments
  { date: "2025-06-01", moneySpent: 154 },
  { date: "2025-06-10", moneySpent: 200 },
];

  
type ChartItem = {
    date: string;
    moneySpent: number;
  };


  // Usage
  const months: string[] = Array.from(
    new Set(chartData.map(item => {
      const [year, month, day] = item.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleString('default', { month: 'long' });
    }))
  );
  

const chartConfig = {
  moneySpent: {
    label: "Money Spent",
    color: "var(--chart-1)", 
  },
} satisfies ChartConfig;
export function ChartLineLabel() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Filter data to only include items from the selected month
  const filteredData = chartData.filter(item => {
        const [year, month, day] = item.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleString("default", { month: "long" }) === selectedMonth;
      })
    
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthy Spending</CardTitle>
        <CardDescription><SelectDemo months={months} onMonthSelect={setSelectedMonth} /></CardDescription>
      </CardHeader>
      <CardContent>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={filteredData} 
          margin={{
            top: 20,
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(_, index) => (index + 1).toString()}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Line
            dataKey="moneySpent"
            type="natural"
            stroke={chartConfig.moneySpent.color} // or any color you want
            strokeWidth={2}
            dot={{
              r: 4,
              fill: "var(--chart-1)",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  )
}
