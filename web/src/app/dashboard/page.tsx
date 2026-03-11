"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import {
  CreditCard,
  TrendingUp,
  Receipt,
  Tag,
  Calendar,
  Upload,
  LogOut,
  Download,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type PaymentRow = {
  date: string
  merchant: string
  category: string
  amount: string
}

const payments: PaymentRow[] = [
  { date: "Feb 28", merchant: "Whole Foods Market", category: "Groceries", amount: "-$86.40" },
  { date: "Feb 27", merchant: "Soho Sushi", category: "Dining out", amount: "-$42.10" },
  { date: "Feb 26", merchant: "City Gym Membership", category: "Personal care", amount: "-$59.00" },
  { date: "Feb 25", merchant: "Netflix", category: "Entertainment", amount: "-$19.99" },
  { date: "Feb 24", merchant: "Uber", category: "Transportation", amount: "-$18.50" },
  { date: "Feb 23", merchant: "Target", category: "Shopping", amount: "-$134.20" },
  { date: "Feb 22", merchant: "Starbucks", category: "Dining out", amount: "-$6.80" },
  { date: "Feb 21", merchant: "Amazon", category: "Shopping", amount: "-$52.00" },
  { date: "Feb 20", merchant: "Shell Gas", category: "Transportation", amount: "-$48.30" },
  { date: "Feb 19", merchant: "Trader Joe's", category: "Groceries", amount: "-$67.15" },
]

const dailySpending = [
  { day: "1", value: 120 },
  { day: "3", value: 85 },
  { day: "5", value: 150 },
  { day: "7", value: 60 },
  { day: "9", value: 100 },
  { day: "11", value: 170 },
  { day: "13", value: 130 },
  { day: "15", value: 45 },
  { day: "17", value: 110 },
  { day: "19", value: 75 },
  { day: "21", value: 140 },
  { day: "23", value: 90 },
  { day: "25", value: 160 },
  { day: "27", value: 55 },
]

const CATEGORY_DATA = [
  { name: "Dining", color: "#f97316", amount: "$1,280" },
  { name: "Shopping", color: "#3b82f6", amount: "$890" },
  { name: "Transport", color: "#8b5cf6", amount: "$650" },
  { name: "Groceries", color: "#10b981", amount: "$520" },
  { name: "Entertainment", color: "#ec4899", amount: "$450" },
  { name: "Other", color: "var(--color-muted-foreground)", amount: "$440" },
]

const METRIC_CARDS = [
  {
    label: "Total Spent",
    value: "$4,230.00",
    change: "+12.5% from January",
    changeColor: "text-green-600",
    icon: CreditCard,
  },
  {
    label: "Avg Per Day",
    value: "$151.07",
    change: "-3.2% from January",
    changeColor: "text-destructive",
    icon: TrendingUp,
  },
  {
    label: "Transactions",
    value: "48",
    change: "+8 from January",
    changeColor: "text-green-600",
    icon: Receipt,
  },
  {
    label: "Top Category",
    value: "Dining",
    change: "$1,280 · 30% of total",
    changeColor: "text-muted-foreground",
    icon: Tag,
  },
]

type StatementData = {
  month: string
  dateRange: string
  total: string
  transactions: string
  dueDate: string
}

const statementsData: StatementData[] = [
  { month: "February 2026", dateRange: "Feb 1 - Feb 28, 2026", total: "$4,230.00", transactions: "48", dueDate: "Mar 15, 2026" },
  { month: "January 2026", dateRange: "Jan 1 - Jan 31, 2026", total: "$3,760.50", transactions: "42", dueDate: "Feb 15, 2026" },
  { month: "December 2025", dateRange: "Dec 1 - Dec 31, 2025", total: "$5,120.00", transactions: "56", dueDate: "Jan 15, 2026" },
  { month: "November 2025", dateRange: "Nov 1 - Nov 30, 2025", total: "$3,450.75", transactions: "38", dueDate: "Dec 15, 2025" },
  { month: "October 2025", dateRange: "Oct 1 - Oct 31, 2025", total: "$4,890.20", transactions: "51", dueDate: "Nov 15, 2025" },
  { month: "September 2025", dateRange: "Sep 1 - Sep 30, 2025", total: "$3,210.00", transactions: "35", dueDate: "Oct 15, 2025" },
]

// ---------------------------------------------------------------------------
// Daily Spending chart with custom tooltip that renders outside the SVG
// ---------------------------------------------------------------------------

type TooltipState = { x: number; y: number; day: string; value: number } | null

function DailySpendingChart() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [tip, setTip] = React.useState<TooltipState>(null)

  return (
    <div ref={containerRef} className="relative h-[195px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dailySpending}
          margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
          onMouseMove={(state) => {
            if (
              state?.isTooltipActive &&
              state.activePayload?.length &&
              state.activeCoordinate
            ) {
              setTip({
                x: state.activeCoordinate.x,
                y: state.activeCoordinate.y,
                day: state.activeLabel ?? "",
                value: state.activePayload[0].value as number,
              })
            } else {
              setTip(null)
            }
          }}
          onMouseLeave={() => setTip(null)}
        >
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <Tooltip content={() => null} cursor={{ fill: "transparent" }} />
          <Bar
            dataKey="value"
            fill="hsl(var(--primary))"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {tip && (
        <div
          className="pointer-events-none absolute z-50 rounded-md border bg-popover px-3 py-1.5 text-[13px] text-popover-foreground shadow-md"
          style={{
            left: tip.x,
            top: tip.y,
            transform: "translate(-50%, -110%)",
          }}
        >
          <p className="font-medium">Feb {tip.day}, 2026</p>
          <p>${tip.value}.00</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Overview Tab
// ---------------------------------------------------------------------------

function OverviewContent() {
  return (
    <div className="flex flex-1 flex-col gap-7 px-12 py-7">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">
          February 2026
        </h1>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 size-4" />
          February
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        {METRIC_CARDS.map((card) => (
          <Card key={card.label} className="gap-0 py-0">
            <CardHeader className="flex-row items-center justify-between space-y-0 px-5 pb-0 pt-4">
              <span className="text-sm font-medium text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="size-[18px] text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5 pb-4 pt-1">
              <div className="text-[32px] font-bold leading-tight tracking-tight">
                {card.value}
              </div>
              <p className={`text-xs ${card.changeColor}`}>{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Daily Spending Bar Chart */}
        <Card className="gap-0 py-0">
          <CardHeader className="gap-0.5 space-y-0 px-5 pt-4 pb-0">
            <CardTitle className="text-base">Daily Spending</CardTitle>
            <CardDescription className="text-xs">
              February 2026
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-2">
            <DailySpendingChart />
          </CardContent>
        </Card>

        {/* By Category */}
        <Card className="gap-0 py-0">
          <CardHeader className="gap-0.5 space-y-0 px-5 pt-4 pb-0">
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5 px-5 pb-4 pt-3">
            {CATEGORY_DATA.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-sm">{cat.name}</span>
                <span className="text-sm font-semibold">{cat.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Section */}
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Transactions</h2>
          <span className="text-[13px] text-muted-foreground">
            48 transactions
          </span>
        </div>
        <Card className="min-h-0 flex-1 gap-0 overflow-hidden py-0">
          <div className="overflow-auto px-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[110px] text-xs">Date</TableHead>
                  <TableHead className="text-xs">Merchant</TableHead>
                  <TableHead className="w-[150px] text-xs">Category</TableHead>
                  <TableHead className="w-[120px] text-right text-xs">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={`${p.date}-${p.merchant}`}>
                    <TableCell className="text-[13px]">{p.date}</TableCell>
                    <TableCell className="text-[13px]">{p.merchant}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {p.category}
                    </TableCell>
                    <TableCell className="text-right text-[13px] font-medium">
                      {p.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Statements Tab
// ---------------------------------------------------------------------------

function StatementsContent() {
  return (
    <div className="flex flex-1 flex-col gap-7 px-12 py-7">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Statements
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {statementsData.map((s) => (
          <Card key={s.month} className="gap-0 py-0">
            <CardHeader className="flex-row items-center justify-between space-y-0 px-6 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold leading-snug">
                  {s.month}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {s.dateRange}
                </span>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 size-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent className="flex items-center gap-8 px-6 pb-4 pt-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-muted-foreground">
                  Total
                </span>
                <span className="text-base font-semibold">{s.total}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-muted-foreground">
                  Transactions
                </span>
                <span className="text-base font-semibold">
                  {s.transactions}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-muted-foreground">
                  Due Date
                </span>
                <span className="text-base font-semibold">{s.dueDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  return (
    <Tabs defaultValue="overview" className="flex min-h-screen flex-col bg-background">
      {/* Top Nav */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-8">
        <div className="flex items-center gap-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statements">Statements</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm">
            <Upload className="mr-2 size-4" />
            Upload statement
          </Button>
          <Avatar className="size-8">
            <AvatarFallback className="text-xs font-medium">
              JD
            </AvatarFallback>
          </Avatar>
          <Separator orientation="vertical" className="h-5" />
          <Button variant="ghost" size="icon" className="-ml-1 size-8">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Tab Content */}
      <TabsContent value="overview" className="flex flex-1 flex-col">
        <OverviewContent />
      </TabsContent>

      <TabsContent value="statements" className="flex flex-1 flex-col">
        <StatementsContent />
      </TabsContent>
    </Tabs>
  )
}
