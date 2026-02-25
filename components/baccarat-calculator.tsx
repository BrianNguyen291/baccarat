"use client"

import { useState, useCallback, useEffect } from "react"
import { CardInputPanel } from "@/components/card-input-panel"
import { ResultDisplay } from "@/components/result-display"
import { WeightEditor, DEFAULT_WEIGHTS } from "@/components/weight-editor"
import { HistoryPanel, type HistoryRecord } from "@/components/history-panel"
import {
  SimulationPanel,
  type SimulationResult,
} from "@/components/simulation-panel"
import { CalculatorIcon, CloudDownload, CloudUpload, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type RoundValidation =
  | { status: "incomplete"; message: string }
  | { status: "invalid"; message: string }
  | { status: "valid"; message: string }

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

  const getPoint = (card: string) => {
    if (card === "0") return 0
    if (card === "A") return 1
    return Number(card)
  }

  const twoCardTotal = (cards: string[]) =>
    (getPoint(cards[0]) + getPoint(cards[1])) % 10

  const bankerShouldDraw = (bankerTotal: number, playerThirdCard: string) => {
    const playerThirdPoint = getPoint(playerThirdCard)
    if (bankerTotal <= 2) return true
    if (bankerTotal === 3) return playerThirdPoint !== 8
    if (bankerTotal === 4) return playerThirdPoint >= 2 && playerThirdPoint <= 7
    if (bankerTotal === 5) return playerThirdPoint >= 4 && playerThirdPoint <= 7
    if (bankerTotal === 6) return playerThirdPoint === 6 || playerThirdPoint === 7
    return false
  }

  const validateRound = (pCards: string[], bCards: string[]): RoundValidation => {
    if (pCards.length > 3 || bCards.length > 3) {
      return { status: "invalid", message: "單邊最多只能輸入 3 張牌" }
    }

    if (pCards.length < 2 || bCards.length < 2) {
      return { status: "incomplete", message: "請先輸入閒家與莊家各 2 張起始牌" }
    }

    const totalCards = pCards.length + bCards.length
    if (totalCards < 4) {
      return { status: "incomplete", message: "目前牌數不足，請繼續輸入" }
    }
    if (totalCards > 6) {
      return { status: "invalid", message: "每局總牌數最多 6 張" }
    }

    const playerInitial = twoCardTotal(pCards)
    const bankerInitial = twoCardTotal(bCards)
    const hasNatural = playerInitial >= 8 || bankerInitial >= 8

    if (hasNatural) {
      if (totalCards === 4 && pCards.length === 2 && bCards.length === 2) {
        return { status: "valid", message: "例牌局（8/9）可直接判定" }
      }
      return { status: "invalid", message: "例牌（8/9）不應再補牌，總牌數應為 4 張" }
    }

    if (totalCards === 4) {
      if (pCards.length !== 2 || bCards.length !== 2) {
        return { status: "invalid", message: "4 張牌時必須是閒 2 張、莊 2 張" }
      }

      const playerDraws = playerInitial <= 5
      const bankerDrawsWhenPlayerStands = bankerInitial <= 5

      if (playerDraws || bankerDrawsWhenPlayerStands) {
        return { status: "incomplete", message: "依標準補牌規則，本局仍需補牌（第 5 張）" }
      }

      return { status: "valid", message: "雙方皆停牌（6/7），4 張牌可直接判定" }
    }

    if (totalCards === 5) {
      const playerDrewThird = pCards.length === 3 && bCards.length === 2
      const bankerDrewThird = pCards.length === 2 && bCards.length === 3

      if (!playerDrewThird && !bankerDrewThird) {
        return {
          status: "invalid",
          message: "5 張牌只能是閒補第 3 張或莊補第 3 張其中一種",
        }
      }

      if (playerDrewThird) {
        if (playerInitial >= 6) {
          return { status: "invalid", message: "閒家起始牌為 6/7 時不應補第 3 張" }
        }
        const shouldBankerDraw = bankerShouldDraw(bankerInitial, pCards[2])
        if (shouldBankerDraw) {
          return { status: "incomplete", message: "依規則莊家仍需補第 3 張（第 6 張）" }
        }
        return { status: "valid", message: "5 張牌局面符合標準補牌規則" }
      }

      if (playerInitial <= 5) {
        return { status: "invalid", message: "閒家起始牌 0-5 應先補第 3 張，不可只莊補牌" }
      }
      if (bankerInitial >= 6) {
        return { status: "invalid", message: "閒家停牌時，莊家起始牌 6/7 不應補第 3 張" }
      }
      return { status: "valid", message: "5 張牌局面符合標準補牌規則" }
    }

    if (pCards.length !== 3 || bCards.length !== 3) {
      return { status: "invalid", message: "6 張牌時必須是閒 3 張、莊 3 張" }
    }
    if (playerInitial >= 6) {
      return { status: "invalid", message: "閒家起始牌為 6/7 時不應有第 3 張" }
    }
    if (!bankerShouldDraw(bankerInitial, pCards[2])) {
      return { status: "invalid", message: "依規則此局莊家不應補第 3 張" }
    }
    return { status: "valid", message: "6 張牌局面符合標準補牌規則" }
  }

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
  const recommendation: "banker" | "player" | null = isReadyToCalculate
    ? totalScore >= 0
      ? "banker"
      : "player"
    : null

  const handleSubmit = () => {
    if (!isReadyToCalculate) return

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
        toast.message("雲端尚無設定")
        return
      }

      setWeights(data.settings.weights)
      setSimulationDecks(data.settings.simulation.decks)
      setSimulationIterations(data.settings.simulation.iterations)
      setLastSyncedAt(data.settings.updatedAt)
      toast.success("已載入雲端設定")
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
                請手動輸入本局牌面（依標準百家樂補牌規則）
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
