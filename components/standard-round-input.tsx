"use client"

import { CardButton } from "@/components/card-button"
import { cn } from "@/lib/utils"
import { getLastDealtSide, getNextStep } from "@/lib/baccarat-rules"
import { RotateCcw, Undo2 } from "lucide-react"

const CARD_LABELS = ["0", "A", "2", "3", "4", "5", "6", "7", "8", "9"]

interface StandardRoundInputProps {
  playerCards: string[]
  bankerCards: string[]
  onAddCard: (side: "player" | "banker", card: string) => void
  onUndoLast: () => void
  onClear: () => void
}

export function StandardRoundInput({
  playerCards,
  bankerCards,
  onAddCard,
  onUndoLast,
  onClear,
}: StandardRoundInputProps) {
  const step = getNextStep(playerCards, bankerCards)
  const totalCards = playerCards.length + bankerCards.length

  const getNextSlotLabel = () => {
    if (step.status !== "need_card") return null
    if (step.side === "player") {
      if (playerCards.length === 0) return "第1張"
      if (playerCards.length === 1) return "第2張"
      return "第5張"
    }
    if (bankerCards.length === 0) return "第3張"
    if (bankerCards.length === 1) return "第4張"
    return playerCards.length >= 3 ? "第6張" : "第5張"
  }

  const nextSlotLabel = getNextSlotLabel()

  const rows = [
    { playerLabel: "第1張", playerValue: playerCards[0], bankerLabel: "第3張", bankerValue: bankerCards[0] },
    { playerLabel: "第2張", playerValue: playerCards[1], bankerLabel: "第4張", bankerValue: bankerCards[1] },
    { playerLabel: "第5張", playerValue: playerCards[2], bankerLabel: "第6張", bankerValue: bankerCards[2] },
  ]

  const lastDealtSide = getLastDealtSide(playerCards, bankerCards)

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">標準發牌輸入</h3>
          <p className="text-xs text-muted-foreground">依畫面提示輸入牌序</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndoLast}
            disabled={totalCards === 0}
            className={cn(
              "h-9 px-3 rounded-lg text-xs font-semibold border border-border",
              "flex items-center gap-1.5 transition-all",
              totalCards === 0
                ? "text-muted-foreground opacity-50 cursor-not-allowed"
                : "text-foreground hover:bg-secondary cursor-pointer"
            )}
          >
            <Undo2 className="h-3.5 w-3.5" />
            上一步
          </button>
          <button
            onClick={onClear}
            disabled={totalCards === 0}
            className={cn(
              "h-9 px-3 rounded-lg text-xs font-semibold border border-border",
              "flex items-center gap-1.5 transition-all",
              totalCards === 0
                ? "text-muted-foreground opacity-50 cursor-not-allowed"
                : "text-foreground hover:bg-secondary cursor-pointer"
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            清空
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="text-center text-xs font-bold text-player">閒</div>
        <div className="text-center text-xs font-bold text-banker">莊</div>
        {rows.map((row) => (
          <div key={row.playerLabel} className="contents">
            <div
              className={cn(
                "rounded-lg border px-2 py-2 text-center border-player/30 bg-player/5",
                nextSlotLabel === row.playerLabel && "ring-2 ring-player border-player"
              )}
            >
              <div className="text-[11px] text-player font-semibold">{row.playerLabel}</div>
              <div className="font-mono text-lg font-bold min-h-7 text-foreground">
                {row.playerValue ?? "—"}
              </div>
            </div>
            <div
              className={cn(
                "rounded-lg border px-2 py-2 text-center border-banker/30 bg-banker/5",
                nextSlotLabel === row.bankerLabel && "ring-2 ring-banker border-banker"
              )}
            >
              <div className="text-[11px] text-banker font-semibold">{row.bankerLabel}</div>
              <div className="font-mono text-lg font-bold min-h-7 text-foreground">
                {row.bankerValue ?? "—"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "rounded-lg px-3 py-2 text-xs font-medium",
          step.status === "need_card" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
          step.status === "complete" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          step.status === "invalid" && "bg-destructive/10 text-destructive border border-destructive/20"
        )}
      >
        {step.message}
        {step.status === "need_card" && (
          <span className="ml-2">
            下一張：{nextSlotLabel ?? (step.side === "player" ? "閒家" : "莊家")}
          </span>
        )}
        {lastDealtSide && step.status !== "invalid" && (
          <span className="ml-2 text-muted-foreground">上一張：{lastDealtSide === "player" ? "閒家" : "莊家"}</span>
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {CARD_LABELS.map((card) => (
          <CardButton
            key={card}
            label={card}
            onClick={() => {
              if (step.status !== "need_card") return
              onAddCard(step.side, card)
            }}
            disabled={step.status !== "need_card"}
          />
        ))}
      </div>
    </div>
  )
}
