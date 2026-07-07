export type FxStatus = "up" | "down" | "flat"

export type CurrencyMeta = {
  country: string
  currencyName: string
  code: string
  countryCode: string
}

export type CurrencyRate = CurrencyMeta & {
  rate: number
  change: number
  status: FxStatus
}

export type FxSnapshot = {
  rates: CurrencyRate[]
  updatedAt: string | null
  isLive: boolean
}

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

let previousRates: Record<string, number> = {}

function toStatus(change: number): FxStatus {
  if (change > 0.01) return "up"
  if (change < -0.01) return "down"
  return "flat"
}

async function fetchLiveRates(): Promise<Record<string, number>> {
  const url = `https://api.twelvedata.com/exchange_rate`

  const res = await fetch(url, {
    next: {
      revalidate: 300,
    },
  })

  if (!res.ok) throw new Error("Unable to fetch FX data")

  const data = await res.json()

  return data.rates
}

export async function getFxSnapshot(): Promise<FxSnapshot> {
  try {
    const live = await fetchLiveRates()

    const rates: CurrencyRate[] = currencies
      .map((currency) => {
        const current = live[currency.code] ?? 0

        const previous = previousRates[currency.code] ?? current

        const change =
          previous === 0
            ? 0
            : ((current - previous) / previous) * 100

        previousRates[currency.code] = current

        return {
          ...currency,
          rate: current,
          change,
          status: toStatus(change),
        }
      })
      .filter((r) => r.rate > 0)

    return {
      rates,
      updatedAt: new Date().toISOString(),
      isLive: true,
    }
  } catch {
    return {
      rates: currencies.map((c) => ({
        ...c,
        rate: 0,
        change: 0,
        status: "flat",
      })),
      updatedAt: null,
      isLive: false,
    }
  }
}

export function formatRate(rate: number) {
  const digits =
    rate >= 1000
      ? 0
      : rate >= 100
      ? 2
      : 4

  return rate.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
