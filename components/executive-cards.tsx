import { Card, CardContent } from "@/components/ui/card"
import {
  Clock,
  DollarSign,
  Globe2,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Metric = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent: string
  iconBg: string
  valueClassName?: string
}

export function ExecutiveCards({
  lastUpdated,
  count,
  isLive,
}: {
  lastUpdated: string
  count: number
  isLive: boolean
}) {
  const metrics: Metric[] = [
    {
      label: "Last Updated",
      value: `${lastUpdated} IST`,
      hint: "3:00 PM IST daily fixing",
      icon: Clock,
      accent: "bg-primary",
      iconBg: "bg-primary/10 text-primary",
      valueClassName: "text-lg leading-snug",
    },
    {
      label: "Base Currency",
      value: "USD",
      hint: "US Dollar",
      icon: DollarSign,
      accent: "bg-[oklch(0.62_0.15_155)]",
      iconBg: "bg-[oklch(0.95_0.05_155)] text-[oklch(0.45_0.13_155)]",
    },
    {
      label: "Currencies Monitored",
      value: String(count),
      hint: "Asia-Pacific region",
      icon: Globe2,
      accent: "bg-[oklch(0.65_0.14_230)]",
      iconBg: "bg-[oklch(0.95_0.04_230)] text-[oklch(0.45_0.15_230)]",
    },
    {
      label: "Auto Refresh",
      value: "15 min",
      hint: "Every 15 minutes",
      icon: RefreshCw,
      accent: "bg-[oklch(0.7_0.16_55)]",
      iconBg: "bg-[oklch(0.95_0.05_75)] text-[oklch(0.5_0.14_55)]",
    },
    {
  label: "Data Status",
  value: isLive ? "LIVE" : "OFFLINE",
  hint: isLive
    ? "Exchange rates available"
    : "Using fallback data",
  icon: isLive ? Wifi : WifiOff,
  accent: isLive
    ? "bg-green-500"
    : "bg-red-500",
  iconBg: isLive
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700",
   },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((m) => (
        <Card
          key={m.label}
          className="group relative overflow-hidden rounded-xl border-border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className={`absolute inset-x-0 top-0 h-1 ${m.accent}`} aria-hidden="true" />
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
              <p
                className={`mt-2 text-2xl font-semibold tabular-nums text-foreground ${
                  m.valueClassName ?? "truncate"
                }`}
              >
                {m.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${m.iconBg}`}
            >
              <m.icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
