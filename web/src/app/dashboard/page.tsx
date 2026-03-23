"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { LogOut, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ---------------------------------------------------------------------------
// Design tokens from spec
// ---------------------------------------------------------------------------

const COLORS = {
  textPrimary: "#1A1918",
  textSecondary: "#6D6C6A",
  textMuted: "#9C9B99",
  positive: "#4D9B6A",
  negative: "#D08068",
  link: "#3D8A5A",
  divider: "#E5E4E1",
  background: "#F5F4F1",
  card: "#FFFFFF",
  barFill: "#C4D9B8",
}

const PIE_COLORS: Record<string, string> = {
  Dining: "#E8B4A0",
  "Shopping/Personal Care": "#B5CCE2",
  Transportation: "#C4D9B8",
  Groceries: "#D5C7A3",
  Entertainment: "#C9B8D9",
  Other: "#DADAD8",
  "Health/Education": "#DADAD8",
  "Utilities/Subscriptions": "#DADAD8",
  Transfers: "#DADAD8",
}

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

// Max categories to show individually in pie; rest grouped as "Other"
const MAX_PIE_SLICES = 5

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type Transaction = {
  id: number
  transaction_date: string
  description: string
  amount: string | number
  category: string
}

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

function toNum(v: string | number) {
  return typeof v === "string" ? parseFloat(v) : v
}

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

function getMonthDateRange(key: string) {
  const [year, month] = key.split("-")
  const y = Number(year)
  const m = Number(month)
  const lastDay = new Date(y, m, 0).getDate()
  const monthName = new Date(y, m - 1).toLocaleDateString("en-US", { month: "short" })
  return `${monthName} 1\u2013${lastDay}, ${year}`
}

type CategoryData = { name: string; amount: number; color: string }

function computeMetrics(txns: Transaction[]) {
  const totalSpent = txns.reduce((s, t) => s + Math.abs(toNum(t.amount)), 0)
  const uniqueDays = new Set(txns.map((t) => t.transaction_date.slice(0, 10)))
  const avgPerDay = uniqueDays.size > 0 ? totalSpent / uniqueDays.size : 0

  // category breakdown
  const catMap = new Map<string, number>()
  for (const t of txns) {
    const cat = t.category || "Other"
    catMap.set(cat, (catMap.get(cat) ?? 0) + Math.abs(toNum(t.amount)))
  }

  const sorted = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])
  const topSlices = sorted.slice(0, MAX_PIE_SLICES)
  const otherTotal = sorted.slice(MAX_PIE_SLICES).reduce((s, [, v]) => s + v, 0)

  const categories: CategoryData[] = topSlices.map(([name, amount]) => ({
    name,
    amount,
    color: PIE_COLORS[name] || "#DADAD8",
  }))
  if (otherTotal > 0) {
    categories.push({ name: "Other", amount: otherTotal, color: "#DADAD8" })
  }

  const topCat = categories[0]

  // daily spending
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

// ---------------------------------------------------------------------------
// Donut Chart (custom SVG for center label)
// ---------------------------------------------------------------------------

function DonutChart({
  data,
  totalLabel,
}: {
  data: CategoryData[]
  totalLabel: string
}) {
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const outerR = 80
  const innerR = 55
  const total = data.reduce((s, d) => s + d.amount, 0)

  if (total === 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={outerR} fill="#DADAD8" />
        <circle cx={cx} cy={cy} r={innerR} fill="white" />
      </svg>
    )
  }

  let cumulative = 0
  const arcs = data.map((slice) => {
    const startAngle = (cumulative / total) * 360 - 90
    cumulative += slice.amount
    const endAngle = (cumulative / total) * 360 - 90
    return { ...slice, startAngle, endAngle }
  })

  function polarToCartesian(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  return (
    <svg width={size} height={size}>
      {arcs.map((arc, i) => {
        const s1 = polarToCartesian(arc.startAngle, outerR)
        const e1 = polarToCartesian(arc.endAngle, outerR)
        const s2 = polarToCartesian(arc.endAngle, innerR)
        const e2 = polarToCartesian(arc.startAngle, innerR)
        const large = arc.endAngle - arc.startAngle > 180 ? 1 : 0
        const d = [
          `M ${s1.x} ${s1.y}`,
          `A ${outerR} ${outerR} 0 ${large} 1 ${e1.x} ${e1.y}`,
          `L ${s2.x} ${s2.y}`,
          `A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y}`,
          "Z",
        ].join(" ")
        return <path key={i} d={d} fill={arc.color} />
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        dominantBaseline="auto"
        style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 16, fill: COLORS.textPrimary }}
      >
        {totalLabel}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        dominantBaseline="auto"
        style={{ fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: 11, fill: COLORS.textMuted }}
      >
        total
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Daily Spending Bar Chart
// ---------------------------------------------------------------------------

type DailyDatum = { day: string; label: string; value: number }
type TooltipState = { x: number; y: number; label: string; value: number } | null

function DailySpendingChart({ data }: { data: DailyDatum[] }) {
  const [tip, setTip] = React.useState<TooltipState>(null)

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center" style={{ fontFamily: "var(--font-outfit)", fontSize: 13, color: COLORS.textMuted }}>
        No spending data
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.value))

  return (
    <div className="relative h-[220px] w-full">
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
          <Tooltip content={() => null} cursor={{ fill: "transparent" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={COLORS.barFill}
                fillOpacity={entry.value === maxVal ? 1.0 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {tip && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: tip.x,
            top: tip.y,
            transform: "translate(-50%, -110%)",
            background: COLORS.card,
            border: `1px solid ${COLORS.divider}`,
            borderRadius: 8,
            padding: "6px 12px",
            fontFamily: "var(--font-outfit)",
            fontSize: 13,
            boxShadow: "0 2px 12px rgba(26,25,24,0.08)",
          }}
        >
          <p style={{ fontWeight: 500, color: COLORS.textPrimary }}>{tip.label}</p>
          <p style={{ color: COLORS.textSecondary }}>{formatAmount(tip.value)}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Classify Dialog
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
                <TableHead className="w-[100px] text-right text-xs">Amount</TableHead>
                <TableHead className="w-[200px] text-xs">Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uncategorized.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-[13px]">{formatDate(t.transaction_date)}</TableCell>
                  <TableCell className="text-[13px]">{t.description}</TableCell>
                  <TableCell className="text-right text-[13px] font-medium">{formatAmount(t.amount)}</TableCell>
                  <TableCell>
                    <Select value={assignments[t.id] || ""} onValueChange={(v) => set(t.id, v)}>
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
          <Button variant="outline" onClick={onDone}>Skip</Button>
          <Button onClick={handleSave} disabled={saving || !allAssigned}>
            {saving ? "Saving..." : "Save Categories"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Mock data — used as fallback when backend is unavailable
// ---------------------------------------------------------------------------

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1,  transaction_date: "2026-02-28", description: "Sushi Palace",     amount: -85.40,  category: "Dining" },
  { id: 2,  transaction_date: "2026-02-27", description: "Amazon Order",     amount: -124.99, category: "Shopping/Personal Care" },
  { id: 3,  transaction_date: "2026-02-26", description: "Uber Ride",        amount: -32.50,  category: "Transportation" },
  { id: 4,  transaction_date: "2026-02-25", description: "Whole Foods",      amount: -67.23,  category: "Groceries" },
  { id: 5,  transaction_date: "2026-02-24", description: "Netflix",          amount: -15.99,  category: "Entertainment" },
  { id: 6,  transaction_date: "2026-02-23", description: "Starbucks",        amount: -6.75,   category: "Dining" },
  { id: 7,  transaction_date: "2026-02-22", description: "Gas Station",      amount: -45.00,  category: "Transportation" },
  { id: 8,  transaction_date: "2026-02-21", description: "Costco",           amount: -132.50, category: "Groceries" },
  { id: 9,  transaction_date: "2026-02-20", description: "Spotify",          amount: -11.99,  category: "Entertainment" },
  { id: 10, transaction_date: "2026-02-19", description: "Tim Hortons",      amount: -8.45,   category: "Dining" },
  { id: 11, transaction_date: "2026-02-18", description: "Shoppers Drug",    amount: -23.40,  category: "Health/Education" },
  { id: 12, transaction_date: "2026-02-17", description: "H&M",             amount: -64.99,  category: "Shopping/Personal Care" },
  { id: 13, transaction_date: "2026-02-16", description: "Rogers",           amount: -85.00,  category: "Utilities/Subscriptions" },
  { id: 14, transaction_date: "2026-02-15", description: "Chipotle",         amount: -18.50,  category: "Dining" },
  { id: 15, transaction_date: "2026-02-14", description: "Cineplex",         amount: -28.00,  category: "Entertainment" },
  { id: 16, transaction_date: "2026-02-13", description: "Metro",            amount: -54.30,  category: "Groceries" },
  { id: 17, transaction_date: "2026-02-12", description: "Shell Gas",        amount: -52.00,  category: "Transportation" },
  { id: 18, transaction_date: "2026-02-11", description: "McDonald's",       amount: -12.75,  category: "Dining" },
  { id: 19, transaction_date: "2026-02-10", description: "Best Buy",         amount: -199.99, category: "Shopping/Personal Care" },
  { id: 20, transaction_date: "2026-02-09", description: "Loblaws",          amount: -78.60,  category: "Groceries" },
  { id: 21, transaction_date: "2026-02-08", description: "Uber Ride",        amount: -22.30,  category: "Transportation" },
  { id: 22, transaction_date: "2026-02-07", description: "Pizza Nova",       amount: -34.50,  category: "Dining" },
  { id: 23, transaction_date: "2026-02-06", description: "iCloud Storage",   amount: -3.99,   category: "Utilities/Subscriptions" },
  { id: 24, transaction_date: "2026-02-05", description: "Rexall Pharmacy",  amount: -15.80,  category: "Health/Education" },
  { id: 25, transaction_date: "2026-02-04", description: "Dollarama",        amount: -9.50,   category: "Shopping/Personal Care" },
  { id: 26, transaction_date: "2026-02-03", description: "Freshco",          amount: -62.40,  category: "Groceries" },
  { id: 27, transaction_date: "2026-02-02", description: "Steam Games",      amount: -29.99,  category: "Entertainment" },
  { id: 28, transaction_date: "2026-02-01", description: "Parking Lot",      amount: -12.00,  category: "Transportation" },
  // January data for month-over-month comparison
  { id: 29, transaction_date: "2026-01-30", description: "Sushi Nami",       amount: -72.00,  category: "Dining" },
  { id: 30, transaction_date: "2026-01-28", description: "Amazon",           amount: -89.99,  category: "Shopping/Personal Care" },
  { id: 31, transaction_date: "2026-01-27", description: "Uber Ride",        amount: -28.00,  category: "Transportation" },
  { id: 32, transaction_date: "2026-01-25", description: "Costco",           amount: -145.60, category: "Groceries" },
  { id: 33, transaction_date: "2026-01-24", description: "Netflix",          amount: -15.99,  category: "Entertainment" },
  { id: 34, transaction_date: "2026-01-22", description: "Starbucks",        amount: -7.25,   category: "Dining" },
  { id: 35, transaction_date: "2026-01-20", description: "Shell Gas",        amount: -48.00,  category: "Transportation" },
  { id: 36, transaction_date: "2026-01-18", description: "Loblaws",          amount: -92.30,  category: "Groceries" },
  { id: 37, transaction_date: "2026-01-15", description: "Rogers",           amount: -85.00,  category: "Utilities/Subscriptions" },
  { id: 38, transaction_date: "2026-01-12", description: "Tim Hortons",      amount: -5.60,   category: "Dining" },
  { id: 39, transaction_date: "2026-01-10", description: "Metro",            amount: -43.20,  category: "Groceries" },
  { id: 40, transaction_date: "2026-01-08", description: "Spotify",          amount: -11.99,  category: "Entertainment" },
  { id: 41, transaction_date: "2026-01-05", description: "Cineplex",         amount: -24.00,  category: "Entertainment" },
  { id: 42, transaction_date: "2026-01-03", description: "Petro Canada",     amount: -55.00,  category: "Transportation" },
]

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [uncategorized, setUncategorized] = React.useState<Transaction[]>([])
  const [showClassify, setShowClassify] = React.useState(false)
  const [monthFilter, setMonthFilter] = React.useState("")

  const fetchTransactions = React.useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      try {
        const res = await fetch("http://localhost:3300/file/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setTransactions(data)
            return
          }
        }
      } catch {
        // backend unavailable — fall through to mock data
      }
    }
    setTransactions(MOCK_TRANSACTIONS)
  }, [])

  React.useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Available months
  const availableMonths = React.useMemo(() => {
    const set = new Set<string>()
    for (const t of transactions) {
      const key = getMonthKey(t.transaction_date)
      if (key) set.add(key)
    }
    return Array.from(set).sort().reverse()
  }, [transactions])

  // Auto-select most recent month
  React.useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(monthFilter)) {
      setMonthFilter(availableMonths[0])
    }
  }, [availableMonths, monthFilter])

  // Filter out transfers, then by month
  const noTransfers = React.useMemo(
    () => transactions.filter((t) => !(t.category || "").toLowerCase().startsWith("transfer")),
    [transactions],
  )

  const filtered = React.useMemo(() => {
    if (!monthFilter) return noTransfers
    return noTransfers.filter((t) => getMonthKey(t.transaction_date) === monthFilter)
  }, [noTransfers, monthFilter])

  const { totalSpent, avgPerDay, categories, topCat, dailySpending } = React.useMemo(
    () => computeMetrics(filtered),
    [filtered],
  )

  const headerLabel = monthFilter ? formatMonthLabel(monthFilter) : "Dashboard"
  const dateRange = monthFilter ? getMonthDateRange(monthFilter) : ""

  // Previous month comparison (simple)
  const prevMonthKey = React.useMemo(() => {
    if (!monthFilter) return null
    const idx = availableMonths.indexOf(monthFilter)
    return idx >= 0 && idx < availableMonths.length - 1 ? availableMonths[idx + 1] : null
  }, [monthFilter, availableMonths])

  const prevMetrics = React.useMemo(() => {
    if (!prevMonthKey) return null
    const prevTxns = noTransfers.filter((t) => getMonthKey(t.transaction_date) === prevMonthKey)
    if (prevTxns.length === 0) return null
    return computeMetrics(prevTxns)
  }, [prevMonthKey, noTransfers])

  const prevMonthName = prevMonthKey
    ? new Date(Number(prevMonthKey.split("-")[0]), Number(prevMonthKey.split("-")[1]) - 1).toLocaleDateString("en-US", { month: "short" })
    : null

  function pctChange(curr: number, prev: number | undefined) {
    if (prev === undefined || prev === 0) return null
    return ((curr - prev) / prev) * 100
  }

  const spentChange = pctChange(totalSpent, prevMetrics?.totalSpent)
  const avgChange = pctChange(avgPerDay, prevMetrics?.avgPerDay)

  const prevTxnCount = prevMonthKey
    ? noTransfers.filter((t) => getMonthKey(t.transaction_date) === prevMonthKey).length
    : null

  // Upload handler
  const openFilePicker = () => fileInputRef.current?.click()

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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        let message = "Upload failed"
        try {
          const data = await res.json()
          message = data?.error || data?.message || message
        } catch {}
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

  const font = "var(--font-outfit)"

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: COLORS.background, fontFamily: font }}
    >
      {/* ── Top Nav ── */}
      <header
        className="flex h-14 shrink-0 items-center justify-between"
        style={{ background: COLORS.card, padding: "0 40px" }}
      >
        <div className="flex items-center gap-3">
          <h1 style={{ fontSize: 18, fontWeight: 600, color: COLORS.textPrimary }}>
            {headerLabel}
          </h1>
          {availableMonths.length > 1 && (
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger
                className="h-7 w-auto gap-1 border-none bg-transparent px-2 text-xs shadow-none"
                style={{ fontFamily: font, color: COLORS.textMuted }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((key) => (
                  <SelectItem key={key} value={key}>{formatMonthLabel(key)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={openFilePicker}
            disabled={isUploading}
            className="cursor-pointer border-none bg-transparent"
            style={{ fontFamily: font, fontSize: 13, fontWeight: 500, color: COLORS.textSecondary }}
          >
            <span className="flex items-center gap-1.5">
              <Upload size={14} />
              {isUploading ? "Uploading..." : "Upload statement"}
            </span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer border-none bg-transparent"
            style={{ color: COLORS.textMuted }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ── Metrics Row ── */}
      <div
        className="grid grid-cols-4 gap-5"
        style={{ padding: "28px 40px" }}
      >
        {/* Total Spent */}
        <div
          className="flex flex-col gap-1"
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: "0 2px 12px rgba(26,25,24,0.03)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.textMuted }}>Total Spent</span>
          <span style={{ fontSize: 32, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -1 }}>
            {formatAmount(totalSpent)}
          </span>
          {spentChange !== null && prevMonthName && (
            <span style={{ fontSize: 12, fontWeight: 500, color: spentChange >= 0 ? COLORS.positive : COLORS.negative }}>
              {spentChange >= 0 ? "+" : ""}{spentChange.toFixed(1)}% from {prevMonthName}
            </span>
          )}
        </div>

        {/* Avg Per Day */}
        <div
          className="flex flex-col gap-1"
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: "0 2px 12px rgba(26,25,24,0.03)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.textMuted }}>Avg Per Day</span>
          <span style={{ fontSize: 32, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -1 }}>
            {formatAmount(avgPerDay)}
          </span>
          {avgChange !== null && prevMonthName && (
            <span style={{ fontSize: 12, fontWeight: 500, color: avgChange <= 0 ? COLORS.positive : COLORS.negative }}>
              {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(1)}% from {prevMonthName}
            </span>
          )}
        </div>

        {/* Transactions */}
        <div
          className="flex flex-col gap-1"
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: "0 2px 12px rgba(26,25,24,0.03)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.textMuted }}>Transactions</span>
          <span style={{ fontSize: 32, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -1 }}>
            {filtered.length}
          </span>
          {prevTxnCount !== null && prevMonthName && (
            <span style={{
              fontSize: 12,
              fontWeight: 500,
              color: filtered.length >= prevTxnCount ? COLORS.positive : COLORS.negative,
            }}>
              {filtered.length >= prevTxnCount ? "+" : ""}{filtered.length - prevTxnCount} from {prevMonthName}
            </span>
          )}
        </div>

        {/* Top Category */}
        <div
          className="flex flex-col gap-1"
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: "0 2px 12px rgba(26,25,24,0.03)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.textMuted }}>Top Category</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.5 }}>
            {topCat?.name ?? "\u2014"}
          </span>
          {topCat && (
            <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.textSecondary }}>
              {formatAmount(topCat.amount)} &middot; {totalSpent > 0 ? Math.round((topCat.amount / totalSpent) * 100) : 0}%
            </span>
          )}
        </div>
      </div>

      {/* ── Daily Spending Chart ── */}
      <div style={{ padding: "0 40px" }}>
        <div
          className="flex flex-col gap-4"
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: "24px 28px",
            boxShadow: "0 2px 12px rgba(26,25,24,0.03)",
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.textPrimary }}>
              Daily Spending
            </span>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>
              {dateRange}
            </span>
          </div>
          <DailySpendingChart data={dailySpending} />
        </div>
      </div>

      {/* ── Bottom Section: Category + Transactions ── */}
      <div
        className="grid flex-1 gap-5"
        style={{
          padding: "20px 40px 40px 40px",
          gridTemplateColumns: "440px 1fr",
        }}
      >
        {/* Spending by Category */}
        <div
          className="flex flex-col gap-5"
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: "24px 28px",
            boxShadow: "0 2px 12px rgba(26,25,24,0.03)",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.textPrimary }}>
            Spending by Category
          </span>
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <DonutChart
                data={categories}
                totalLabel={`$${Math.round(totalSpent).toLocaleString()}`}
              />
            </div>
            <div
              className="min-w-0 flex-1"
              style={{ display: "grid", gridTemplateColumns: "10px 1fr auto", rowGap: 14, columnGap: 10, alignItems: "center" }}
            >
              {categories.map((cat) => (
                <React.Fragment key={cat.name}>
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate" style={{ fontSize: 13, fontWeight: 500, color: COLORS.textPrimary }}>
                    {cat.name}
                  </span>
                  <span className="tabular-nums text-right" style={{ fontSize: 13, fontWeight: 500, color: COLORS.textSecondary }}>
                    {formatAmount(cat.amount)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          className="flex flex-col"
          style={{
            background: COLORS.card,
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(26,25,24,0.03)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{ padding: "20px 28px", borderBottom: `1px solid ${COLORS.divider}` }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.textPrimary }}>
              Recent Transactions
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.link, cursor: "pointer" }}>
              View All
            </span>
          </div>

          {/* Column headers */}
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: "1fr 140px 100px 90px",
              padding: "12px 28px",
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.textMuted,
            }}
          >
            <span>Description</span>
            <span>Category</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-auto" style={{ maxHeight: 400 }}>
            {filtered.map((t) => (
              <div
                key={t.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "1fr 140px 100px 90px",
                  padding: "14px 28px",
                  borderBottom: `1px solid ${COLORS.divider}`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.textPrimary }}>
                  {t.description}
                </span>
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>
                  {t.category}
                </span>
                <span style={{ fontSize: 13, color: COLORS.textMuted }}>
                  {formatDate(t.transaction_date)}
                </span>
                <span className="text-right" style={{ fontSize: 13, fontWeight: 500, color: COLORS.textPrimary }}>
                  {formatAmount(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ClassifyDialog
        open={showClassify}
        uncategorized={uncategorized}
        onDone={() => {
          setShowClassify(false)
          setUncategorized([])
          fetchTransactions()
        }}
      />
    </div>
  )
}
