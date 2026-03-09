'use client'

import * as React from "react"
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

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type StatementItem = { label: string; color: string }

type PaymentRow = {
  date: string
  merchant: string
  category: string
  amount: string
  status: "Paid"
}

const payments: PaymentRow[] = [
  {
    date: "Mar 02",
    merchant: "Whole Foods Market",
    category: "Groceries",
    amount: "-$86.40",
    status: "Paid",
  },
  {
    date: "Mar 01",
    merchant: "Soho Sushi",
    category: "Dining out",
    amount: "-$42.10",
    status: "Paid",
  },
  {
    date: "Feb 28",
    merchant: "City Gym Membership",
    category: "Personal care",
    amount: "-$59.00",
    status: "Paid",
  },
  {
    date: "Feb 27",
    merchant: "Netflix",
    category: "Entertainment",
    amount: "-$19.99",
    status: "Paid",
  },
  {
    date: "Feb 25",
    merchant: "Uber",
    category: "Transportation",
    amount: "-$18.50",
    status: "Paid",
  },
]

const statements: StatementItem[] = [
  { label: "Feb 2026 • Visa_ending_4821.pdf", color: "#0D0D0D" },
  { label: "Jan 2026 • Visa_ending_4821.pdf", color: "#7A7A7A" },
  { label: "Dec 2025 • Visa_ending_4821.pdf", color: "#B0B0B0" },
]

function parseAmount(amount: string): number {
  const numeric = parseFloat(amount.replace(/[^\d.-]/g, ""))
  if (Number.isNaN(numeric)) return 0
  return Math.abs(numeric)
}

type DailySpendingPoint = { day: string; value: number }

function buildDailySpending(data: PaymentRow[]): DailySpendingPoint[] {
  const byDate = new Map<string, number>()

  for (const payment of data) {
    const amount = parseAmount(payment.amount)
    byDate.set(payment.date, (byDate.get(payment.date) ?? 0) + amount)
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => {
      // Use a fixed year to keep sort stable by calendar order.
      return new Date(`${a} 2026`).getTime() - new Date(`${b} 2026`).getTime()
    })
    .map(([date, total]) => ({
      day: date,
      value: Number(total.toFixed(2)),
    }))
}

type CategorySpendingPoint = {
  name: string
  value: number
  color: string
  percent: number
}

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#E42313",
  "Dining out": "#22C55E",
  Entertainment: "#0D0D0D",
  "Personal care": "#7A7A7A",
  Transportation: "#94A3B8",
}

function buildCategorySpending(data: PaymentRow[]): CategorySpendingPoint[] {
  const byCategory = new Map<string, number>()

  for (const payment of data) {
    const amount = parseAmount(payment.amount)
    byCategory.set(payment.category, (byCategory.get(payment.category) ?? 0) + amount)
  }

  const raw = Array.from(byCategory.entries()).map(([name, total]) => ({
    name,
    value: Number(total.toFixed(2)),
    color: CATEGORY_COLORS[name] ?? "#0F172A",
  }))

  const grandTotal = raw.reduce((sum, item) => sum + item.value, 0)

  return raw.map((item) => ({
    ...item,
    percent: grandTotal > 0 ? (item.value / grandTotal) * 100 : 0,
  }))
}

const dailySpending = buildDailySpending(payments)
const spendingByCategory = buildCategorySpending(payments)

function RangeChip({ children }: { children: React.ReactNode }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-auto rounded-none border-[#E8E8E8] px-[10px] py-1 text-[11px] font-normal text-[#0D0D0D]"
    >
      {children}
    </Button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-[#0D0D0D]">
      {children}
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white px-[28px] py-[20px]">
      <div className="mx-auto flex w-full max-w-[1440px] gap-8">
        <aside className="flex h-[calc(100vh-40px)] w-[278px] flex-col gap-5 border border-[#E8E8E8] bg-white px-8 py-10">
          <div className="flex flex-col gap-1">
            <div className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-[#0D0D0D]">
              Statements
            </div>
            <div className="text-[12px] font-normal text-[#7A7A7A]">
              Uploaded credit card statements
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {statements.map((s) => (
              <div key={s.label} className="flex h-7 items-center gap-2">
                <div
                  className="h-4 w-2"
                  style={{ backgroundColor: s.color }}
                  aria-hidden="true"
                />
                <div className="text-[12px] font-normal text-[#0D0D0D]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          <button
            type="button"
            className="w-fit rounded-none px-2 py-3 font-[family-name:var(--font-display)] text-[13px] font-medium text-[#0D0D0D]"
          >
            Logout
          </button>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-[14px]">
          <header className="flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-display)] text-[32px] font-medium tracking-[-1px] text-[#0D0D0D]">
              Credit Card Overview
            </h1>
            <p className="text-[14px] font-normal text-[#7A7A7A]">
              Track daily spending and recent payments
            </p>
          </header>

          <section className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 rounded-none border border-[#E8E8E8] bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <SectionTitle>Spending per day</SectionTitle>
                  <div className="text-[12px] font-normal text-[#7A7A7A]">
                    Last 30 days • $4,230 total
                  </div>
                </div>
                <RangeChip>30D</RangeChip>
              </div>

              <div className="mt-4 h-[224px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySpending} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      interval={0}
                      tick={{ fill: "#7A7A7A", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        backgroundColor: "#0D0D0D",
                        border: "none",
                        borderRadius: 0,
                        color: "#FFFFFF",
                        fontSize: 12,
                      }}
                      labelStyle={{
                        color: "#FFFFFF",
                        fontSize: 11,
                      }}
                      formatter={(value: unknown) => [`$${value}`, "spent"]}
                    />
                    <Bar dataKey="value" fill="#E42313" radius={0} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full rounded-none border border-[#E8E8E8] bg-white p-6 lg:w-[340px]">
              <div className="flex items-start justify-between gap-3">
                <SectionTitle>Spending by category</SectionTitle>
                <RangeChip>This month</RangeChip>
              </div>

              <div className="mt-4 flex items-center gap-5">
                <div className="h-[140px] w-[140px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E8E8E8",
                          borderRadius: 4,
                          color: "#0D0D0D",
                          fontSize: 12,
                          padding: "6px 10px",
                        }}
                        formatter={(value: unknown, _name, rawPayload) => {
                          const amount =
                            typeof value === "number" ? value : Number(value)
                          const payload = rawPayload as {
                            payload?: { name?: string }
                          }
                          const label = payload?.payload?.name ?? ""
                          return [`$${Number(amount).toFixed(2)}`, label]
                        }}
                      />
                      <Pie
                        data={spendingByCategory}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={70}
                        paddingAngle={1}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        {spendingByCategory.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex min-w-0 flex-col gap-[10px]">
                  {spendingByCategory.map((c) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <div
                        className="h-[10px] w-[10px]"
                        style={{ backgroundColor: c.color }}
                        aria-hidden="true"
                      />
                      <div className="text-[12px] font-normal text-[#0D0D0D]">
                        {c.name} • {c.percent.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-[#0D0D0D]">
                Payments history
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto rounded-none border-[#E8E8E8] px-3 py-[6px] text-[13px] font-normal text-[#0D0D0D]"
                >
                  Last 30 days
                </Button>
                <Button
                  type="button"
                  className="h-auto rounded-none bg-[#0D0D0D] px-4 py-2 font-[family-name:var(--font-display)] text-[13px] font-medium text-white hover:bg-[#0D0D0D]/90"
                >
                  Upload statement
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-none border border-[#E8E8E8]">
              <Table className="table-fixed">
                <TableHeader className="[&_tr]:border-b-[#E8E8E8]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-10 px-5 text-[12px] font-normal text-[#7A7A7A] w-[120px]">
                      Date
                    </TableHead>
                    <TableHead className="h-10 px-5 text-[12px] font-normal text-[#7A7A7A] w-[220px]">
                      Merchant
                    </TableHead>
                    <TableHead className="h-10 px-5 text-[12px] font-normal text-[#7A7A7A] w-[160px]">
                      Category
                    </TableHead>
                    <TableHead className="h-10 px-5 text-right text-[12px] font-normal text-[#7A7A7A] w-[120px]">
                      Amount
                    </TableHead>
                    <TableHead className="h-10 px-5 text-right text-[12px] font-normal text-[#7A7A7A] w-[120px]">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow
                      key={`${p.date}-${p.merchant}`}
                      className="h-11 border-b-[#E8E8E8] hover:bg-transparent"
                    >
                      <TableCell className="px-5 text-[13px] font-normal text-[#0D0D0D] w-[120px]">
                        {p.date}
                      </TableCell>
                      <TableCell className="px-5 text-[13px] font-normal text-[#0D0D0D] w-[220px]">
                        {p.merchant}
                      </TableCell>
                      <TableCell className="px-5 text-[13px] font-normal text-[#0D0D0D] w-[160px]">
                        {p.category}
                      </TableCell>
                      <TableCell className="px-5 text-right font-[family-name:var(--font-display)] text-[13px] font-medium text-[#0D0D0D] w-[120px]">
                        {p.amount}
                      </TableCell>
                      <TableCell className="px-5 text-right text-[12px] font-normal text-[#22C55E] w-[120px]">
                        {p.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

