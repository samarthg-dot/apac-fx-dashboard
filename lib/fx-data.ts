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

export type FxApiResponse = {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

const BASE_URL = "https://api.frankfurter.dev/v1"

function toStatus(change: number): FxStatus {
  if (change > 0.01) return "up"
  if (change < -0.01) return "down"
  return "flat"
}

async function fetchRates(date?: string): Promise<Record<string, number>> {
  const endpoint = date
    ? `${BASE_URL}/${date}?base=USD`
    : `${BASE_URL}/latest?base=USD`

  const res = await fetch(endpoint, {
    next: {
      revalidate: 300, // Refresh every 5 minutes
    },
  })

  if (!res.ok) {
    throw new Error("Unable to fetch FX data")
  }

  const data: FxApiResponse = await res.json()

  return data.rates
}

export async function getFxSnapshot(): Promise<FxSnapshot> {
  try {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)

    const yesterdayDate = yesterday.toISOString().split("T")[0]

    const [todayRates, yesterdayRates] = await Promise.all([
      fetchRates(),
      fetchRates(yesterdayDate),
    ])

    const rates: CurrencyRate[] = currencies
      .map((currency) => {
        const current = todayRates[currency.code]

        if (current == null) return null

        const previous = yesterdayRates[currency.code] ?? current

        const change =
          previous === 0
            ? 0
            : ((current - previous) / previous) * 100

        return {
          ...currency,
          rate: current,
          change,
          status: toStatus(change),
        }
      })
      .filter((r): r is CurrencyRate => r !== null)

    return {
      rates,
      updatedAt: new Date().toISOString(),
      isLive: true,
    }
  } catch (error) {
    console.error("FX API Error:", error)

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
