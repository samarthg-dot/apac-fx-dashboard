import { DashboardHeader } from "@/components/dashboard-header"
import { ExecutiveCards } from "@/components/executive-cards"
import { FxTable } from "@/components/fx-table"
import { ChartPlaceholders } from "@/components/chart-placeholder"
import { getFxSnapshot } from "@/lib/fx-data"

export const revalidate = 900

export default async function Page() {
  const { rates, updatedAt, isLive } = await getFxSnapshot()

  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      })
    : "--"

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <ExecutiveCards lastUpdated={lastUpdated} count={rates.length} />
        <FxTable rates={rates} />
        <section aria-label="Charts">
          <ChartPlaceholders />
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            {isLive
              ? "Reference rates as of the 3:00 PM IST daily fixing (ECB, with market data for TWD/VND). Base currency: USD."
              : "Reference rates are temporarily unavailable. Base currency: USD."}
          </p>
        </div>
      </footer>
    </div>
  )
}
