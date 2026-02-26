"use client"

import { useState, useCallback, useEffect } from "react"
import { ResultDisplay } from "@/components/result-display"
import { WeightEditor, DEFAULT_WEIGHTS } from "@/components/weight-editor"
import { HistoryPanel, type HistoryRecord } from "@/components/history-panel"
import {
  SimulationPanel,
  type SimulationResult,
} from "@/components/simulation-panel"
import { StandardRoundInput } from "@/components/standard-round-input"
import { WeightPresetManager } from "@/components/weight-preset-manager"
import { CalculatorIcon, CloudDownload, CloudUpload, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getLastDealtSide, validateRound } from "@/lib/baccarat-rules"

export function BaccaratCalculator() {
  const CARD_LABELS = ["0", "A", "2", "3", "4", "5", "6", "7", "8", "9"]
  const CARD_COUNTS_PER_DECK = [16, 4, 4, 4, 4, 4, 4, 4, 4, 4]
  const [playerCards, setPlayerCards] = useState<string[]>([])
  const [bankerCards, setBankerCards] = useState<string[]>([])
  const [weights, setWeights] = useState<Record<string, number>>({
    ...DEFAULT_WEIGHTS,
  })
  const [simulationDecks, setSimulationDecks] = useState(8)
  const [simulationIterations, setSimulationIterations] = useState(20000)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(
    null
  )
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
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
  const hasCards = allCards.length > 0
  const roundValidation = validateRound(playerCards, bankerCards)
  const isReadyToCalculate = roundValidation.status === "valid"
  const totalScore = isReadyToCalculate
    ? calculateScore(playerCards, bankerCards)
    : 0
  const recentWindow = history.slice(0, 6)
  const rollingSum6 =
    recentWindow.length === 6
      ? recentWindow.reduce((sum, item) => sum + item.score, 0)
      : null
  const recommendation: "banker" | "player" | null =
    rollingSum6 === null ? null : rollingSum6 >= 0 ? "banker" : "player"

  const handleSubmit = () => {
    if (!isReadyToCalculate) return

    setHistory((prev) => {
      const recentScores = [totalScore, ...prev.map((item) => item.score)]
      const recordRollingSum6 =
        recentScores.length >= 6
          ? recentScores.slice(0, 6).reduce((sum, score) => sum + score, 0)
          : null

      const record: HistoryRecord = {
        id: nextId,
        playerCards: [...playerCards],
        bankerCards: [...bankerCards],
        score: totalScore,
        rollingSum6: recordRollingSum6,
        recommendation:
          recordRollingSum6 === null
            ? null
            : recordRollingSum6 >= 0
              ? "banker"
              : "player",
        timestamp: new Date(),
      }

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
    setSimulationResult(null)
  }

  const handleWeightChange = (card: string, value: number) => {
    setWeights((prev) => ({ ...prev, [card]: value }))
  }

  const handleWeightReset = () => {
    setWeights({ ...DEFAULT_WEIGHTS })
    toast.success("權重已重設為預設值")
  }

  const handleSimulate = () => {
    if (!isReadyToCalculate) return

    const labelToIndex = Object.fromEntries(
      CARD_LABELS.map((label, index) => [label, index])
    ) as Record<string, number>

    const counts = CARD_COUNTS_PER_DECK.map(
      (countPerDeck) => countPerDeck * simulationDecks
    )

    for (const card of allCards) {
      const idx = labelToIndex[card]
      if (idx !== undefined && counts[idx] > 0) {
        counts[idx] -= 1
      }
    }

    const totalAvailable = counts.reduce((sum, n) => sum + n, 0)
    if (totalAvailable < 6) {
      toast.error("可用牌數不足，請增加牌靴副數")
      return
    }

    let bankerWins = 0
    let playerWins = 0
    let scoreSum = 0

    for (let run = 0; run < simulationIterations; run += 1) {
      const localCounts = [...counts]
      let remain = totalAvailable
      let score = 0

      for (let draw = 0; draw < 6; draw += 1) {
        const target = Math.floor(Math.random() * remain)
        let cumulative = 0
        let chosen = 0

        for (let i = 0; i < localCounts.length; i += 1) {
          cumulative += localCounts[i]
          if (target < cumulative) {
            chosen = i
            break
          }
        }

        localCounts[chosen] -= 1
        remain -= 1
        score += weights[CARD_LABELS[chosen]] || 0
      }

      scoreSum += score
      if (score >= 0) {
        bankerWins += 1
      } else {
        playerWins += 1
      }
    }

    setSimulationResult({
      runs: simulationIterations,
      bankerRate: bankerWins / simulationIterations,
      playerRate: playerWins / simulationIterations,
      avgScore: scoreSum / simulationIterations,
    })
  }

  const handleClearHistory = () => {
    setHistory([])
    toast.success("歷史紀錄已清除")
  }

  const handleAddCardByFlow = (side: "player" | "banker", card: string) => {
    if (side === "player") {
      setPlayerCards((prev) => (prev.length < 3 ? [...prev, card] : prev))
      return
    }
    setBankerCards((prev) => (prev.length < 3 ? [...prev, card] : prev))
  }

  const handleUndoLastCard = () => {
    const side = getLastDealtSide(playerCards, bankerCards)
    if (!side) return
    if (side === "player") {
      setPlayerCards((prev) => prev.slice(0, -1))
    } else {
      setBankerCards((prev) => prev.slice(0, -1))
    }
  }

  const handleApplyPreset = (presetWeights: Record<string, number>) => {
    setWeights(presetWeights)
  }

  const handleLoadCloudSettings = useCallback(async () => {
    setIsLoadingSettings(true)
    try {
      const res = await fetch("/api/settings", { method: "GET" })
      const data = (await res.json()) as {
        settings: {
          weights: Record<string, number>
          simulation: { decks: number; iterations: number }
          updatedAt: string
        } | null
        error?: string
      }

      if (!res.ok) {
        throw new Error(data.error || "Load failed")
      }

      if (!data.settings) {
        return
      }

      setWeights(data.settings.weights)
      setSimulationDecks(data.settings.simulation.decks)
      setSimulationIterations(data.settings.simulation.iterations)
      setLastSyncedAt(data.settings.updatedAt)
    } catch (error) {
      toast.error(`載入失敗：${String(error)}`)
    } finally {
      setIsLoadingSettings(false)
    }
  }, [])

  const handleSaveCloudSettings = useCallback(async () => {
    setIsSavingSettings(true)
    try {
      const payload = {
        weights,
        simulation: { decks: simulationDecks, iterations: simulationIterations },
      }
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as {
        ok?: boolean
        settings?: { updatedAt: string }
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Save failed")
      }

      setLastSyncedAt(data.settings?.updatedAt ?? new Date().toISOString())
      toast.success("已儲存到雲端")
    } catch (error) {
      toast.error(`儲存失敗：${String(error)}`)
    } finally {
      setIsSavingSettings(false)
    }
  }, [weights, simulationDecks, simulationIterations])

  useEffect(() => {
    setSimulationResult(null)
  }, [playerCards, bankerCards, weights, simulationDecks, simulationIterations])

  useEffect(() => {
    void handleLoadCloudSettings()
  }, [handleLoadCloudSettings])

  const bankerCount = history.filter((r) => r.recommendation === "banker").length
  const playerCount = history.filter((r) => r.recommendation === "player").length

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
              <StandardRoundInput
                playerCards={playerCards}
                bankerCards={bankerCards}
                onAddCard={handleAddCardByFlow}
                onUndoLast={handleUndoLastCard}
                onClear={handleReset}
              />
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                <button
                  onClick={handleSubmit}
                  disabled={!isReadyToCalculate}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg",
                    "font-semibold text-sm transition-all duration-150",
                    "cursor-pointer",
                    isReadyToCalculate
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
              <p className="mt-3 text-xs text-muted-foreground">
                請手動輸入本局牌面（系統已限制為標準百家樂發牌流程）
              </p>
              <p
                className={cn(
                  "mt-1 text-xs",
                  roundValidation.status === "valid" && "text-emerald-400",
                  roundValidation.status === "incomplete" && "text-amber-400",
                  roundValidation.status === "invalid" && "text-destructive"
                )}
              >
                {roundValidation.message}
              </p>
            </div>

            <ResultDisplay
              totalScore={rollingSum6 ?? 0}
              recommendation={recommendation}
              playerCards={playerCards}
              bankerCards={bankerCards}
            />

            <WeightEditor
              weights={weights}
              onWeightChange={handleWeightChange}
              onReset={handleWeightReset}
            />
            <WeightPresetManager
              weights={weights}
              onApplyPreset={handleApplyPreset}
            />

            <div className="lg:hidden">
              <HistoryPanel records={history} onClear={handleClearHistory} />
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">雲端設定</h3>
                <span className="text-xs text-muted-foreground">Upstash Redis</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleLoadCloudSettings}
                  disabled={isLoadingSettings}
                  className={cn(
                    "h-10 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer",
                    "flex items-center justify-center gap-2",
                    isLoadingSettings
                      ? "bg-secondary text-muted-foreground cursor-not-allowed"
                      : "bg-secondary text-secondary-foreground hover:opacity-90"
                  )}
                >
                  <CloudDownload className="h-4 w-4" />
                  {isLoadingSettings ? "載入中..." : "從雲端載入"}
                </button>
                <button
                  onClick={handleSaveCloudSettings}
                  disabled={isSavingSettings}
                  className={cn(
                    "h-10 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer",
                    "flex items-center justify-center gap-2",
                    isSavingSettings
                      ? "bg-secondary text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                  )}
                >
                  <CloudUpload className="h-4 w-4" />
                  {isSavingSettings ? "儲存中..." : "儲存到雲端"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {lastSyncedAt
                  ? `最後同步：${new Date(lastSyncedAt).toLocaleString()}`
                  : "尚未同步"}
              </p>
            </div>

            <SimulationPanel
              isReady={isReadyToCalculate}
              decks={simulationDecks}
              iterations={simulationIterations}
              result={simulationResult}
              onDecksChange={setSimulationDecks}
              onIterationsChange={setSimulationIterations}
              onSimulate={handleSimulate}
            />
          </div>

          <div className="hidden lg:block lg:col-span-1">
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
