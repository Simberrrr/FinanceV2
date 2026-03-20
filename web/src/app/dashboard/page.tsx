"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
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
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "Transportation",
  "Groceries",
  "Dining",
  "Entertainment",
  "Shopping/Personal Care",
  "Health/Education",
  "Utilities/Subscriptions",
  "Transfers",
]

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type Transaction = {
  id: number
  transaction_date: string
  description: string
  amount: string | number
  category: string
}

/** Parse "YYYY-MM-DD" without timezone shift */
function parseLocalDate(value: string) {
  const parts = value.slice(0, 10).split("-")
  if (parts.length !== 3) return null
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return isNaN(d.getTime()) ? null : d
}

function formatDate(value: string) {
  const d = parseLocalDate(value)
  if (!d) return value
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatAmount(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(n)) return "$0.00"
  const abs = Math.abs(n)
  return `${n < 0 ? "-" : ""}$${abs.toFixed(2)}`
}

const CATEGORY_COLORS = [
  "#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899",
  "#eab308", "#14b8a6", "#f43f5e", "#6366f1", "#84cc16",
]

function toNum(v: string | number) {
  return typeof v === "string" ? parseFloat(v) : v
}

function computeMetrics(txns: Transaction[]) {
  const totalSpent = txns.reduce((s, t) => s + Math.abs(toNum(t.amount)), 0)
  const uniqueDays = new Set(txns.map((t) => t.transaction_date.slice(0, 10)))
  const avgPerDay = uniqueDays.size > 0 ? totalSpent / uniqueDays.size : 0

  // category breakdown
  const catMap = new Map<string, number>()
  for (const t of txns) {
    const cat = t.category || "Uncategorised"
    catMap.set(cat, (catMap.get(cat) ?? 0) + Math.abs(toNum(t.amount)))
  }
  const categories = Array.from(catMap.entries())
    .map(([name, amount], i) => ({
      name,
      amount,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount)

  const topCat = categories[0]

  // daily spending — keyed by ISO date string
  const dayMap = new Map<string, number>()
  for (const t of txns) {
    const d = parseLocalDate(t.transaction_date)
    if (!d) continue
    const key = t.transaction_date.slice(0, 10)
    dayMap.set(key, (dayMap.get(key) ?? 0) + Math.abs(toNum(t.amount)))
  }
  const dailySpending = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, value]) => {
      const d = parseLocalDate(dateStr)!
      return {
        day: String(d.getDate()),
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.round(value * 100) / 100,
      }
    })

  return { totalSpent, avgPerDay, categories, topCat, dailySpending }
}

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

type DailyDatum = { day: string; label: string; value: number }
type TooltipState = { x: number; y: number; label: string; value: number } | null

function DailySpendingChart({ data }: { data: DailyDatum[] }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [tip, setTip] = React.useState<TooltipState>(null)

  if (data.length === 0) {
    return (
      <div className="flex h-[195px] items-center justify-center text-sm text-muted-foreground">
        No spending data
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-[195px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
          onMouseMove={(state) => {
            if (
              state?.isTooltipActive &&
              state.activePayload?.length &&
              state.activeCoordinate
            ) {
              const payload = state.activePayload[0].payload as DailyDatum
              setTip({
                x: state.activeCoordinate.x,
                y: state.activeCoordinate.y,
                label: payload.label,
                value: payload.value,
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
          <p className="font-medium">{tip.label}</p>
          <p>{formatAmount(tip.value)}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Classify Dialog — shown after upload when some transactions are "Unknown"
// ---------------------------------------------------------------------------

function ClassifyDialog({
  open,
  uncategorized,
  onDone,
}: {
  open: boolean
  uncategorized: Transaction[]
  onDone: () => void
}) {
  const [assignments, setAssignments] = React.useState<Record<number, string>>({})
  const [saving, setSaving] = React.useState(false)

  const set = (id: number, cat: string) =>
    setAssignments((prev) => ({ ...prev, [id]: cat }))

  const allAssigned = uncategorized.every((t) => !!assignments[t.id])

  const handleSave = async () => {
    const updates = uncategorized
      .filter((t) => assignments[t.id])
      .map((t) => ({ id: t.id, category: assignments[t.id] }))
    if (updates.length === 0) {
      onDone()
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) return
    try {
      setSaving(true)
      const res = await fetch(
        "http://localhost:3300/file/transactions/categories",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ updates }),
        },
      )
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Categories updated.")
    } catch {
      toast.error("Failed to update categories.")
    } finally {
      setSaving(false)
      onDone()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDone()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Classify Transactions</DialogTitle>
          <DialogDescription>
            {uncategorized.length} transaction
            {uncategorized.length !== 1 ? "s" : ""} could not be automatically
            categorized. Please assign a category to each one.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto flex-1 -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] text-xs">Date</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="w-[100px] text-right text-xs">
                  Amount
                </TableHead>
                <TableHead className="w-[200px] text-xs">Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uncategorized.map((t) => (
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
                  <TableCell>
                    <Select
                      value={assignments[t.id] || ""}
                      onValueChange={(v) => set(t.id, v)}
                    >
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            Skip
          </Button>
          <Button onClick={handleSave} disabled={saving || !allAssigned}>
            {saving ? "Saving..." : "Save Categories"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Overview Tab
// ---------------------------------------------------------------------------

function getMonthKey(dateStr: string) {
  const d = parseLocalDate(dateStr)
  if (!d) return null
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

  const [chartMonthFilter, setChartMonthFilter] = React.useState("")

  React.useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(chartMonthFilter)) {
      setChartMonthFilter(availableMonths[0])
    }
  }, [availableMonths, chartMonthFilter])

  const noTransfers = React.useMemo(
    () => transactions.filter((t) => !(t.category || "").toLowerCase().startsWith("transfer")),
    [transactions],
  )

  const filtered = React.useMemo(() => {
    if (monthFilter === "all") return noTransfers
    return noTransfers.filter((t) => getMonthKey(t.transaction_date) === monthFilter)
  }, [noTransfers, monthFilter])

  const headerLabel =
    monthFilter === "all" ? "All Transactions" : formatMonthLabel(monthFilter)

  const { totalSpent, avgPerDay, categories, topCat } =
    React.useMemo(() => computeMetrics(filtered), [filtered])

  const chartFiltered = React.useMemo(() => {
    if (!chartMonthFilter) return []
    return noTransfers.filter((t) => getMonthKey(t.transaction_date) === chartMonthFilter)
  }, [noTransfers, chartMonthFilter])

  const { dailySpending } = React.useMemo(() => computeMetrics(chartFiltered), [chartFiltered])

  const chartLabel = chartMonthFilter ? formatMonthLabel(chartMonthFilter) : ""

  const metricCards = [
    {
      label: "Total Spent",
      value: formatAmount(totalSpent),
      detail: `${filtered.length} transaction${filtered.length !== 1 ? "s" : ""}`,
      icon: CreditCard,
    },
    {
      label: "Avg Per Day",
      value: formatAmount(avgPerDay),
      detail: `across ${new Set(filtered.map((t) => t.transaction_date.slice(0, 10))).size} days`,
      icon: TrendingUp,
    },
    {
      label: "Transactions",
      value: String(filtered.length),
      detail: `${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`,
      icon: Receipt,
    },
    {
      label: "Top Category",
      value: topCat?.name ?? "—",
      detail: topCat
        ? `${formatAmount(topCat.amount)} · ${totalSpent > 0 ? Math.round((topCat.amount / totalSpent) * 100) : 0}% of total`
        : "No data",
      icon: Tag,
    },
  ]

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
        {metricCards.map((card) => (
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
              <p className="text-xs text-muted-foreground">{card.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Daily Spending Bar Chart */}
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-center justify-between space-y-0 px-5 pt-4 pb-0">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="text-base">Daily Spending</CardTitle>
              <CardDescription className="text-xs">
                {chartLabel}
              </CardDescription>
            </div>
            <Select value={chartMonthFilter} onValueChange={setChartMonthFilter}>
              <SelectTrigger className="w-[170px] h-8 text-xs">
                <Calendar className="mr-1.5 size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((key) => (
                  <SelectItem key={key} value={key}>
                    {formatMonthLabel(key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-2">
            <DailySpendingChart data={dailySpending} />
          </CardContent>
        </Card>

        {/* By Category */}
        <Card className="gap-0 py-0">
          <CardHeader className="gap-0.5 space-y-0 px-5 pt-4 pb-0">
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-3">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <>
                <div className="mx-auto h-[140px] w-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={64}
                        strokeWidth={2}
                      >
                        {categories.map((cat) => (
                          <Cell key={cat.name} fill={cat.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatAmount(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-col gap-2.5">
                  {categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="flex-1 text-sm">{cat.name}</span>
                      <span className="text-sm font-semibold">
                        {formatAmount(cat.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
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
                  <TableHead className="text-xs">Category</TableHead>
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
                    <TableCell className="text-[13px]">
                      {t.category}
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
  const [uncategorized, setUncategorized] = React.useState<Transaction[]>([])
  const [showClassify, setShowClassify] = React.useState(false)

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
      toast.error("Your session expired. Please sign in again.")
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

      const data = await res.json()
      await fetchTransactions()

      if (data.uncategorized && data.uncategorized.length > 0) {
        setUncategorized(data.uncategorized)
        setShowClassify(true)
      } else {
        toast.success("Statement uploaded successfully.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
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

      <ClassifyDialog
        open={showClassify}
        uncategorized={uncategorized}
        onDone={() => {
          setShowClassify(false)
          setUncategorized([])
          fetchTransactions()
        }}
      />
    </Tabs>
  )
}
