'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartLineLabel } from "./chart"
import { ChartPieDonutText } from "./pie_chart"
import { columns, type Payment } from "./payments/columns"
import { DataTable } from "./payments/data-table"
import { Button } from "@/components/ui/button"
import { useState } from "react";
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
  const [activeChart, setActiveChart] = useState("line");
  return (
    <div className="min-h-screen space-y-4 py-6 px-6">
      <div>
        <header className="mb-6 space-y-2 rounded-lg border p-4 bg-black">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-white">
              Dashboard
            </h1>
          </div>
        </header>
      </div>
    {/* Buttons and Chart side by side */}
    <div className="flex items-start gap-6">
      {/* Buttons on the left */}
      <div className="flex flex-col space-y-4">
          <Button onClick={() => setActiveChart("line")}>Line Chart</Button>
          <Button onClick={() => setActiveChart("pie")}>Pie Chart</Button>
          <Button onClick={() => setActiveChart("payments")}>Payments History</Button>
      </div>

      {/* Chart on the right */}
      <div className="w-full">
          {activeChart === "line" && <ChartLineLabel />}
          {activeChart === "pie" && <ChartPieDonutText />}
          {activeChart === "payments" && (
            <Card className="bg-white/95 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <DataTable columns={columns} data={payments} />
              </CardContent>
            </Card>
          )}
      </div>
    </div>

    </div>

  )
}

