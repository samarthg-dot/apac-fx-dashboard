export type FxStatus = "up" | "down" | "flat"

export type CurrencyMeta = {
  country: string
  currencyName: string
  code: string
  /** ISO 3166-1 alpha-2 country code, used for flag rendering */
  countryCode: string
}

export type CurrencyRate = CurrencyMeta & {
  /** Units of local currency per 1 USD */
  rate: number
  /** Percentage change over the last session */
  change: number
  status: FxStatus
}

export type FxSnapshot = {
  rates: CurrencyRate[]
  /** ISO timestamp of the 3:00 PM IST reference fixing */
  updatedAt: string | null
  isLive: boolean
}

// Currency metadata for the Asia-Pacific region (base currency: USD).
export const currencies: CurrencyMeta[] = [
  { country: "Japan", currencyName: "Japanese Yen", code: "JPY", countryCode: "jp" },
  { country: "India", currencyName: "Indian Rupee", code: "INR", countryCode: "in" },
  { country: "China", currencyName: "Chinese Yuan", code: "CNY", countryCode: "cn" },
  { country: "Australia", currencyName: "Australian Dollar", code: "AUD", countryCode: "au" },
  { country: "Singapore", currencyName: "Singapore Dollar", code: "SGD", countryCode: "sg" },
  { country: "Malaysia", currencyName: "Malaysian Ringgit", code: "MYR", countryCode: "my" },
  { country: "Thailand", currencyName: "Thai Baht", code: "THB", countryCode: "th" },
  { country: "Indonesia", currencyName: "Indonesian Rupiah", code: "IDR", countryCode: "id" },
  { country: "Philippines", currencyName: "Philippine Peso", code: "PHP", countryCode: "ph" },
  { country: "Vietnam", currencyName: "Vietnamese Dong", code: "VND", countryCode: "vn" },
  { country: "Taiwan", currencyName: "New Taiwan Dollar", code: "TWD", countryCode: "tw" },
  { country: "Hong Kong", currencyName: "Hong Kong Dollar", code: "HKD", countryCode: "hk" },
  { country: "South Korea", currencyName: "South Korean Won", code: "KRW", countryCode: "kr" },
  { country: "New Zealand", currencyName: "New Zealand Dollar", code: "NZD", countryCode: "nz" },
]

const codes = currencies.map((c) => c.code)

// IST is UTC+5:30 with no daylight saving.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function toStatus(change: number): FxStatus {
  if (change > 0.001) return "up"
  if (change < -0.001) return "down"
  return "flat"
}

const ymd = (d: Date) => d.toISOString().slice(0, 10)

/**
 * Returns the reference date (YYYY-MM-DD, in IST) for the most recent
 * 3:00 PM IST fixing. If the current IST time is before 3 PM, use the
 * previous day's fixing.
 */
function referenceIstDate(): { date: string; iso: string } {
  const nowIst = new Date(Date.now() + IST_OFFSET_MS)
  // If it's before 15:00 IST, step back one day.
  if (nowIst.getUTCHours() < 15) {
    nowIst.setUTCDate(nowIst.getUTCDate() - 1)
  }
  const date = ymd(nowIst)
  // 3:00 PM IST fixing on the reference date.
  const iso = `${date}T15:00:00+05:30`
  return { date, iso }
}

/**
 * Fetch USD-based reference rates for a given date from Frankfurter (ECB fixing)
 * plus the previous available day, so we can compute the daily change.
 */
async function fetchReferenceRates(date: string): Promise<{
  latest: Record<string, number>
  prev: Record<string, number>
}> {
  const start = new Date(`${date}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() - 7)
  const url = `https://api.frankfurter.dev/v1/${ymd(start)}..${date}?base=USD&symbols=${codes.join(",")}`
  const res = await fetch(url, { next: { revalidate: 900 } })
  if (!res.ok) throw new Error("Reference rate request failed")
  const data = (await res.json()) as { rates: Record<string, Record<string, number>> }
  const days = Object.keys(data.rates ?? {}).sort()
  if (days.length === 0) throw new Error("No reference rates returned")
  return {
    latest: data.rates[days[days.length - 1]] ?? {},
    prev: data.rates[days[days.length - 2]] ?? {},
  }
}

/** Fetch live USD rates to fill currencies not covered by ECB (e.g. TWD, VND). */
async function fetchLiveRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 900 } })
    if (!res.ok) return {}
    const data = (await res.json()) as { result: string; rates: Record<string, number> }
    return data.result === "success" ? (data.rates ?? {}) : {}
  } catch {
    return {}
  }
}

/** Build the FX snapshot using the 3:00 PM IST daily reference fixing. */
export async function getFxSnapshot(): Promise<FxSnapshot> {
  const { date } = referenceIstDate()

  try {
    const [{ latest, prev }, live] = await Promise.all([fetchReferenceRates(date), fetchLiveRates()])

    const rates: CurrencyRate[] = currencies
      .map((c) => {
        const rate = latest[c.code] ?? live[c.code] ?? 0
        const prevRate = prev[c.code]
        const change =
          prevRate != null && prevRate !== 0 && latest[c.code] != null
            ? ((latest[c.code] - prevRate) / prevRate) * 100
            : 0
        return { ...c, rate, change, status: toStatus(change) }
      })
      .filter((c) => c.rate > 0)

    if (rates.length === 0) throw new Error("No usable rates")

    return { rates, updatedAt: iso, isLive: true }
  } catch {
    // Fallback: return metadata with no rates rather than crashing the page.
    return {
      rates: currencies.map((c) => ({ ...c, rate: 0, change: 0, status: "flat" as FxStatus })),
      updatedAt: null,
      isLive: false,
    }
  }
}

export function formatRate(rate: number): string {
  const fractionDigits = rate >= 1000 ? 0 : rate >= 100 ? 2 : 4
  return rate.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}
