"use client"

import { useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowDown, ArrowUp, Minus, RefreshCw, Search } from "lucide-react"
import { formatRate, type CurrencyRate, type FxStatus } from "@/lib/fx-data"

function StatusBadge({ status, change }: { status: FxStatus; change: number }) {
  const formatted = `${change > 0 ? "+" : ""}${change.toFixed(2)}%`

  if (status === "up") {
    return (
      <Badge className="gap-1 border-transparent bg-[oklch(0.95_0.05_155)] text-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.95_0.05_155)]">
        <ArrowUp className="h-3 w-3" aria-hidden="true" />
        {formatted}
      </Badge>
    )
  }
  if (status === "down") {
    return (
      <Badge className="gap-1 border-transparent bg-[oklch(0.95_0.04_25)] text-[oklch(0.5_0.18_25)] hover:bg-[oklch(0.95_0.04_25)]">
        <ArrowDown className="h-3 w-3" aria-hidden="true" />
        {formatted}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1 text-muted-foreground">
      <Minus className="h-3 w-3" aria-hidden="true" />
      {formatted}
    </Badge>
  )
}

export function FxTable({ rates }: { rates: CurrencyRate[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rates
    return rates.filter(
      (r) =>
        r.country.toLowerCase().includes(q) ||
        r.currencyName.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q),
    )
  }, [rates, query])

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <Card className="overflow-hidden rounded-xl border-border shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-border bg-card sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold">Exchange Rates</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or currency"
              aria-label="Search currencies"
              className="h-9 pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            className="h-9 shrink-0 gap-1.5 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
            <span className="hidden sm:inline">Refresh Now</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[520px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="sticky top-0 z-10 w-[28%] border-b border-border bg-muted pl-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Country
                </TableHead>
                <TableHead className="sticky top-0 z-10 border-b border-border bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Currency
                </TableHead>
                <TableHead className="sticky top-0 z-10 border-b border-border bg-muted text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  USD Rate
                </TableHead>
                <TableHead className="sticky top-0 z-10 border-b border-border bg-muted pr-6 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No currencies match &ldquo;{query}&rdquo;.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.code} className="border-border transition-colors hover:bg-accent/40">
                    <TableCell className="pl-6 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={`https://flagcdn.com/w40/${row.countryCode}.png`}
                          alt={`${row.country} flag`}
                          width={24}
                          height={18}
                          className="h-[18px] w-6 shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-border"
                          unoptimized
                        />
                        <span>{row.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                          {row.code}
                        </span>
                        <span className="text-sm text-muted-foreground">{row.currencyName}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-sm font-medium tabular-nums ${
                        row.status === "up"
                          ? "text-[oklch(0.45_0.13_155)]"
                          : row.status === "down"
                            ? "text-[oklch(0.5_0.18_25)]"
                            : "text-foreground"
                      }`}
                    >
                      {formatRate(row.rate)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end">
                        <StatusBadge status={row.status} change={row.change} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
