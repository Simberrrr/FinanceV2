import { Button } from "@/components/ui/button"
import { ChartLineLabel } from "./chart"
export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your dashboard!</p>
          </div>
        </div>
        <div className="mt-8">
          <ChartLineLabel />
        </div>

      </div>
    </div>
  );
}

