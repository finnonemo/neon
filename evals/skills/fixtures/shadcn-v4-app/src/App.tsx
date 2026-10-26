import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Fund = { code: string; name: string; status: "Open" | "Closed"; change: number }

const initialFunds: Fund[] = [
  { code: "K-GINCOME", name: "K Global Income", status: "Open", change: 1.24 },
  { code: "SCBSET", name: "SCB SET Index", status: "Open", change: -0.62 },
  { code: "TMBGQG", name: "TMB Global Quality Growth", status: "Closed", change: 0.18 },
]

const allocation = [
  { label: "Equity", value: 42, color: "bg-chart-1" },
  { label: "Fixed income", value: 23, color: "bg-chart-2" },
  { label: "Property", value: 15, color: "bg-chart-3" },
  { label: "Gold", value: 12, color: "bg-chart-4" },
  { label: "Cash", value: 8, color: "bg-chart-5" },
]

export default function App() {
  const [funds, setFunds] = useState(initialFunds)
  const [code, setCode] = useState("")
  const [dark, setDark] = useState(false)

  function toggleDark() {
    document.documentElement.classList.toggle("dark", !dark)
    setDark(!dark)
  }

  function addFund() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed || funds.some(f => f.code === trimmed)) return
    setFunds([...funds, { code: trimmed, name: "New fund", status: "Open", change: 0 }])
    setCode("")
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fund watchlist</h1>
          <p className="text-sm text-muted-foreground">Track the funds you follow.</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleDark}>
          {dark ? "Light" : "Dark"} mode
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add a fund</CardTitle>
          <CardDescription>Enter a fund code to add it to the watchlist.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            aria-label="Fund code"
            placeholder="e.g. KKP-GB"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addFund()}
          />
          <Button onClick={addFund}>Add fund</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>{funds.length} funds</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {funds.map(fund => (
            <div key={fund.code} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="font-medium">{fund.code}</div>
                <div className="truncate text-sm text-muted-foreground">{fund.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={fund.status === "Open" ? "secondary" : "outline"}>{fund.status}</Badge>
                <span className={fund.change < 0 ? "text-destructive text-sm" : "text-sm"}>
                  {fund.change > 0 ? "+" : ""}
                  {fund.change.toFixed(2)}%
                </span>
                <Button variant="ghost" size="sm">Details</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setFunds(funds.filter(f => f.code !== fund.code))}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allocation</CardTitle>
          <CardDescription>Portfolio by asset class</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex h-3 overflow-hidden rounded-full">
            {allocation.map(a => (
              <div key={a.label} className={a.color} style={{ width: `${a.value}%` }} />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {allocation.map(a => (
              <li key={a.label} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${a.color}`} />
                {a.label} {a.value}%
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
