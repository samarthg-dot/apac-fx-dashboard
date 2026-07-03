import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, BarChart3 } from "lucide-react"

export function ChartPlaceholders() {
  const panels = [
    { title: "USD Strength Trend", icon: LineChart },
    { title: "Regional Volatility", icon: BarChart3 },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {panels.map((p) => (
        <Card
          key={p.title}
          className="overflow-hidden rounded-xl border-border shadow-sm transition-shadow duration-200 hover:shadow-md"
        >
          <CardHeader className="border-b border-border bg-card">
            <CardTitle className="text-base font-semibold">{p.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 text-center">
              <p.icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground">Chart coming soon</p>
              <p className="text-xs text-muted-foreground">Historical data visualization</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
