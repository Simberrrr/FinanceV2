"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type Transaction = {
  id: number
  transaction_date: string
  description: string
  amount: string | number
}

function formatDate(value: string) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatAmount(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(n)) return "$0.00"
  const abs = Math.abs(n)
  return `${n < 0 ? "-" : ""}$${abs.toFixed(2)}`
}

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

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split("-")
  const d = new Date(Number(year), Number(month) - 1)
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function OverviewContent({ transactions }: { transactions: Transaction[] }) {
  const [monthFilter, setMonthFilter] = React.useState("all")

  const availableMonths = React.useMemo(() => {
    const set = new Set<string>()
    for (const t of transactions) {
      const key = getMonthKey(t.transaction_date)
      if (key) set.add(key)
    }
    return Array.from(set).sort().reverse()
  }, [transactions])

  const filtered = React.useMemo(() => {
    if (monthFilter === "all") return transactions
    return transactions.filter((t) => getMonthKey(t.transaction_date) === monthFilter)
  }, [transactions, monthFilter])

  const headerLabel =
    monthFilter === "all" ? "All Transactions" : formatMonthLabel(monthFilter)

  return (
    <div className="flex flex-1 flex-col gap-7 px-12 py-7">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">
          {headerLabel}
        </h1>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[200px]">
            <Calendar className="mr-2 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All transactions</SelectItem>
            {availableMonths.map((key) => (
              <SelectItem key={key} value={key}>
                {formatMonthLabel(key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Card className="max-h-[400px] gap-0 overflow-hidden py-0">
          <div className="overflow-auto max-h-[400px] px-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[110px] text-xs">Date</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="w-[120px] text-right text-xs">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-[13px]">
                      {formatDate(t.transaction_date)}
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {t.description}
                    </TableCell>
                    <TableCell className="text-right text-[13px] font-medium">
                      {formatAmount(t.amount)}
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
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [transactions, setTransactions] = React.useState<Transaction[]>([])

  const fetchTransactions = React.useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    try {
      const res = await fetch("http://localhost:3300/file/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setTransactions(await res.json())
      }
    } catch {
      // silently fail — transactions stay empty
    }
  }, [])

  React.useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const token = localStorage.getItem("accessToken")
    if (!token) {
      alert("Your session expired. Please sign in again.")
      router.push("/")
      event.target.value = ""
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      setIsUploading(true)
      const res = await fetch("http://localhost:3300/file/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        let message = "Upload failed"
        try {
          const data = await res.json()
          message = data?.error || data?.message || message
        } catch {
          // Keep default fallback message when non-JSON error payload is returned.
        }
        throw new Error(message)
      }

      await fetchTransactions()
      alert("Statement uploaded successfully.")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button size="sm" onClick={openFilePicker} disabled={isUploading}>
            <Upload className="mr-2 size-4" />
            {isUploading ? "Uploading..." : "Upload statement"}
          </Button>
          <Avatar className="size-8">
            <AvatarFallback className="text-xs font-medium">
              JD
            </AvatarFallback>
          </Avatar>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="icon"
            className="-ml-1 size-8"
            onClick={() => router.push("/")}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Tab Content */}
      <TabsContent value="overview" className="flex flex-1 flex-col">
        <OverviewContent transactions={transactions} />
      </TabsContent>

      <TabsContent value="statements" className="flex flex-1 flex-col">
        <StatementsContent />
      </TabsContent>
    </Tabs>
  )
}
