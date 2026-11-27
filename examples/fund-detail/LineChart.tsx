// The fund-detail example's chart (README.md beside this file): Core's Line chart
// (core/components/line-chart.md) drawn in SVG, since the Neon registry has no chart.
// It reads one day under the pointer and from the keyboard (arrows, Home, End, Page
// keys) and reports it, so the page can show that day in its figure. Sample data only.
import { useId, useState, type KeyboardEvent, type PointerEvent } from "react"
import "./chart.css"

export type Point = { date: string; value: number }

const thaiDay = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
const thaiShort = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "UTC" })
export const day = (d: string) => thaiDay.format(new Date(d))
const short = (d: string) => thaiShort.format(new Date(d))
const tone = (n: number) => (n > 0 ? "positive" : n < 0 ? "negative" : "neutral")

/** One point a day ending 2026-11-20: deterministic sample data that ends on `end`. */
export function series(days: number, end: number, drift: number, seed = 0): Point[] {
  const last = Date.UTC(2026, 10, 20)
  const raw = Array.from({ length: days }, (_, i) => 1 + drift * (i / 365) + 0.012 * Math.sin(i / 9 + seed) + 0.007 * Math.sin(i / 3.7 + 1 + seed * 2))
  return raw.map((v, i) => ({
    date: new Date(last - (days - 1 - i) * 864e5).toISOString().slice(0, 10),
    value: i === days - 1 ? end : (v / raw[days - 1]) * end,
  }))
}

/** 160 tall at every width; no value axis: the page's figure is the read-out. */
export function LineChart({ data, label, format, onRead }: { data: Point[]; label: string; format: (n: number) => string; onRead: (p: Point | null) => void }) {
  const [at, setAt] = useState<number | null>(null), id = useId()
  const W = 1000, H = 160, n = data.length
  const lo = Math.min(...data.map((d) => d.value)), hi = Math.max(...data.map((d) => d.value))
  const x = (i: number) => (i / (n - 1)) * W
  const y = (v: number) => H - 12 - ((v - lo) / (hi - lo || 1)) * (H - 24)
  const read = (i: number | null) => {
    const k = i === null ? null : Math.max(0, Math.min(n - 1, i))
    setAt(k)
    onRead(k === null ? null : data[k])
  }
  const dot = at ?? n - 1
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ")
  const keys: Record<string, number> = { ArrowLeft: dot - 1, ArrowRight: dot + 1, Home: 0, End: n - 1, PageUp: dot + 7, PageDown: dot - 7 }
  return (
    <div className="chart" data-tone={tone(data[n - 1].value - data[0].value)}>
      <div
        role="slider" tabIndex={0} aria-label={label}
        aria-valuemin={0} aria-valuemax={n - 1} aria-valuenow={dot}
        aria-valuetext={`${day(data[dot].date)} ${format(data[dot].value)}`}
        onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
          const r = e.currentTarget.getBoundingClientRect()
          read(Math.round(((e.clientX - r.left) / r.width) * (n - 1)))
        }}
        onPointerLeave={() => read(null)} onBlur={() => read(null)}
        onKeyDown={(e: KeyboardEvent) => { if (e.key in keys) { e.preventDefault(); read(keys[e.key]) } }}
        style={{ height: H }}
        className="relative w-full touch-pan-y outline-2 -outline-offset-2 outline-transparent focus-visible:outline-ring"
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full">
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--chart-series)" stopOpacity=".16" />
              <stop offset="1" stopColor="var(--chart-series)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.5, H / 2].map((g) => <line key={g} x1={0} x2={W} y1={g} y2={g} stroke="var(--chart-gridline)" strokeWidth={2} strokeLinecap="round" strokeDasharray="0 4" vectorEffect="non-scaling-stroke" />)}
          <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--chart-axis)" vectorEffect="non-scaling-stroke" />
          <polygon fill={`url(#${id})`} points={`0,${H} ${pts} ${W},${H}`} />
          <polyline fill="none" stroke="var(--chart-series)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" points={pts} />
        </svg>
        {at !== null && <span aria-hidden className="absolute inset-y-0 w-px bg-[var(--chart-axis)]" style={{ left: `${(dot / (n - 1)) * 100}%` }} />}
        <span aria-hidden className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-[var(--chart-series)]"
          style={{ left: `clamp(6px, ${(dot / (n - 1)) * 100}%, calc(100% - 6px))`, top: y(data[dot].value) }} />
      </div>
      <div aria-hidden className="flex justify-between px-4 pt-1 text-caption text-muted-foreground">
        {[0, Math.floor(n / 2), n - 1].map((i) => <span key={i}>{short(data[i].date)}</span>)}
      </div>
    </div>
  )
}
