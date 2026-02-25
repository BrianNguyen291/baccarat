"use client"

import { cn } from "@/lib/utils"

export interface SimulationResult {
  runs: number
  bankerRate: number
  playerRate: number
  avgScore: number
}

interface SimulationPanelProps {
  isReady: boolean
  decks: number
  iterations: number
  result: SimulationResult | null
  onDecksChange: (value: number) => void
  onIterationsChange: (value: number) => void
  onSimulate: () => void
}

export function SimulationPanel({
  isReady,
  decks,
  iterations,
  result,
  onDecksChange,
  onIterationsChange,
  onSimulate,
}: SimulationPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">模擬下一局</h3>
        <span className="text-xs text-muted-foreground">Monte Carlo</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">牌靴副數</span>
          <input
            type="number"
            min={1}
            max={12}
            value={decks}
            onChange={(e) =>
              onDecksChange(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))
            }
            className="h-9 rounded-md border border-border bg-input px-3 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">模擬次數</span>
          <input
            type="number"
            min={100}
            max={200000}
            step={100}
            value={iterations}
            onChange={(e) =>
              onIterationsChange(
                Math.max(100, Math.min(200000, parseInt(e.target.value) || 100))
              )
            }
            className="h-9 rounded-md border border-border bg-input px-3 text-sm"
          />
        </label>
      </div>

      <button
        onClick={onSimulate}
        disabled={!isReady}
        className={cn(
          "h-10 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer",
          isReady
            ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
            : "bg-secondary text-muted-foreground cursor-not-allowed"
        )}
      >
        執行模擬
      </button>

      {!isReady && (
        <p className="text-xs text-muted-foreground">
          先輸入本局 6 張牌，模擬才會啟用
        </p>
      )}

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="rounded-md bg-background px-3 py-2">
            <div className="text-xs text-muted-foreground">莊機率</div>
            <div className="font-mono font-bold text-banker">
              {(result.bankerRate * 100).toFixed(2)}%
            </div>
          </div>
          <div className="rounded-md bg-background px-3 py-2">
            <div className="text-xs text-muted-foreground">閒機率</div>
            <div className="font-mono font-bold text-player">
              {(result.playerRate * 100).toFixed(2)}%
            </div>
          </div>
          <div className="rounded-md bg-background px-3 py-2">
            <div className="text-xs text-muted-foreground">平均分數</div>
            <div className="font-mono font-bold text-foreground">
              {result.avgScore >= 0
                ? `+${result.avgScore.toFixed(2)}`
                : result.avgScore.toFixed(2)}
            </div>
          </div>
          <div className="sm:col-span-3 text-xs text-muted-foreground">
            以 {result.runs.toLocaleString()} 次隨機發牌計算（不含已輸入本局 6 張牌）
          </div>
        </div>
      )}
    </div>
  )
}

