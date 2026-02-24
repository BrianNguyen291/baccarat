"use client"

import { useState, useCallback } from "react"
import { CardInputPanel } from "@/components/card-input-panel"
import { ResultDisplay } from "@/components/result-display"
import { WeightEditor, DEFAULT_WEIGHTS } from "@/components/weight-editor"
import { HistoryPanel, type HistoryRecord } from "@/components/history-panel"
import { CalculatorIcon, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function BaccaratCalculator() {
  const [playerCards, setPlayerCards] = useState<string[]>([])
  const [bankerCards, setBankerCards] = useState<string[]>([])
  const [weights, setWeights] = useState<Record<string, number>>({
    ...DEFAULT_WEIGHTS,
  })
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [nextId, setNextId] = useState(1)

  const calculateScore = useCallback(
    (pCards: string[], bCards: string[]) => {
      const allCards = [...pCards, ...bCards]
      return allCards.reduce((sum, card) => sum + (weights[card] || 0), 0)
    },
    [weights]
  )

  const allCards = [...playerCards, ...bankerCards]
  const totalScore =
    allCards.length > 0 ? calculateScore(playerCards, bankerCards) : 0
  const hasCards = allCards.length > 0
  const recommendation: "banker" | "player" | null = hasCards
    ? totalScore >= 0
      ? "banker"
      : "player"
    : null

  const handleSubmit = () => {
    if (!hasCards) return

    const record: HistoryRecord = {
      id: nextId,
      playerCards: [...playerCards],
      bankerCards: [...bankerCards],
      score: totalScore,
      recommendation: totalScore >= 0 ? "banker" : "player",
      timestamp: new Date(),
    }

    setHistory((prev) => {
      const updated = [record, ...prev]
      return updated.slice(0, 100)
    })
    setNextId((prev) => prev + 1)
    setPlayerCards([])
    setBankerCards([])
    toast.success("已記錄本局結果")
  }

  const handleReset = () => {
    setPlayerCards([])
    setBankerCards([])
  }

  const handleWeightChange = (card: string, value: number) => {
    setWeights((prev) => ({ ...prev, [card]: value }))
  }

  const handleWeightReset = () => {
    setWeights({ ...DEFAULT_WEIGHTS })
    toast.success("權重已重設為預設值")
  }

  const handleClearHistory = () => {
    setHistory([])
    toast.success("歷史紀錄已清除")
  }

  const bankerCount = history.filter(
    (r) => r.recommendation === "banker"
  ).length
  const playerCount = history.filter(
    (r) => r.recommendation === "player"
  ).length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
              <CalculatorIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                百家樂牌權重計算器
              </h1>
              <p className="text-xs text-muted-foreground">
                Baccarat Card-Weight Calculator
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-banker" />
                <span className="text-muted-foreground">
                  {"莊"}{" "}
                  <span className="font-mono font-bold text-foreground">
                    {bankerCount}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-player" />
                <span className="text-muted-foreground">
                  {"閒"}{" "}
                  <span className="font-mono font-bold text-foreground">
                    {playerCount}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <CardInputPanel
                  label="閒家 Player"
                  side="player"
                  cards={playerCards}
                  onAddCard={(card) =>
                    setPlayerCards((prev) =>
                      prev.length < 3 ? [...prev, card] : prev
                    )
                  }
                  onRemoveCard={(i) =>
                    setPlayerCards((prev) =>
                      prev.filter((_, idx) => idx !== i)
                    )
                  }
                />
                <CardInputPanel
                  label="莊家 Banker"
                  side="banker"
                  cards={bankerCards}
                  onAddCard={(card) =>
                    setBankerCards((prev) =>
                      prev.length < 3 ? [...prev, card] : prev
                    )
                  }
                  onRemoveCard={(i) =>
                    setBankerCards((prev) =>
                      prev.filter((_, idx) => idx !== i)
                    )
                  }
                />
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                <button
                  onClick={handleSubmit}
                  disabled={!hasCards}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg",
                    "font-semibold text-sm transition-all duration-150",
                    "cursor-pointer",
                    hasCards
                      ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <CalculatorIcon className="h-4 w-4" />
                  記錄本局並清除
                </button>
                <button
                  onClick={handleReset}
                  disabled={!hasCards}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                    "bg-secondary text-secondary-foreground",
                    "hover:bg-destructive/20 hover:text-destructive",
                    "transition-all duration-150 text-sm font-medium cursor-pointer",
                    "disabled:opacity-40 disabled:pointer-events-none"
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  清除
                </button>
              </div>
            </div>

            <ResultDisplay
              totalScore={totalScore}
              recommendation={recommendation}
              playerCards={playerCards}
              bankerCards={bankerCards}
            />

            <WeightEditor
              weights={weights}
              onWeightChange={handleWeightChange}
              onReset={handleWeightReset}
            />
          </div>

          <div className="lg:col-span-1">
            <HistoryPanel records={history} onClear={handleClearHistory} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-muted-foreground">
          純數值計算工具，不涉及任何平台連接或自動下注
        </div>
      </footer>
    </div>
  )
}
