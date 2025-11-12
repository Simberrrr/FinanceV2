'use client'

import { ChartLineLabel } from "./chart"
import { ChartPieDonutText } from "./pie_chart"
import { columns, type Payment } from "./payments/columns"
import { DataTable } from "./payments/data-table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const payments: Payment[] = [
  {
    id: "1f95c4f3",
    amount: 2450,
    status: "success",
    email: "olivia@untitledui.com",
  },
  {
    id: "2e0d1a12",
    amount: 1820,
    status: "processing",
    email: "emma@untitledui.com",
  },
  {
    id: "3a728ed5",
    amount: 980,
    status: "pending",
    email: "isabella@untitledui.com",
  },
  {
    id: "4bb82a1d",
    amount: 1250,
    status: "failed",
    email: "jackson@untitledui.com",
  },
  {
    id: "5cd9e632",
    amount: 3175,
    status: "success",
    email: "amelia@untitledui.com",
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 md:px-8">
        <header className="rounded-2xl bg-white/95 p-8 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your performance metrics and recent payment activity.
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <ChartLineLabel />
          <ChartPieDonutText />
        </section>
        <Card className="w-full">  
        <CardHeader>  
          Payments History
        </CardHeader>
        <CardContent><DataTable columns={columns} data={payments} /></CardContent>
        </Card>

      </div>
    </div>
  )
}

