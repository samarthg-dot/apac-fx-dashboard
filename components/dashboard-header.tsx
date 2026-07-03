import { Activity } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground text-balance">
              APAC FX Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Live Exchange Rates Against USD</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.62_0.15_155)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.62_0.15_155)]" />
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-secondary-foreground">Market Open</span>
        </div>
      </div>
    </header>
  )
}
