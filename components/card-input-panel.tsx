"use client"

import { CardButton } from "@/components/card-button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const CARD_LABELS = ["0", "A", "2", "3", "4", "5", "6", "7", "8", "9"]

interface CardInputPanelProps {
  label: string
  side: "player" | "banker"
  cards: string[]
  onAddCard: (card: string) => void
  onRemoveCard: (index: number) => void
  maxCards?: number
}

export function CardInputPanel({
  label,
  side,
  cards,
  onAddCard,
  onRemoveCard,
  maxCards = 3,
}: CardInputPanelProps) {
  const isPlayer = side === "player"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-3 w-3 rounded-full",
            isPlayer ? "bg-player" : "bg-banker"
          )}
        />
        <h3 className="text-lg font-bold text-foreground">{label}</h3>
        <span className="text-sm text-muted-foreground">
          ({cards.length}/{maxCards})
        </span>
      </div>

      {/* Selected cards display */}
      <div className="flex items-center gap-2 min-h-[3.5rem] px-3 py-2 rounded-lg bg-background border border-border">
        {cards.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            {"點選下方牌面加入..."}
          </span>
        ) : (
          cards.map((card, i) => (
            <button
              key={i}
              onClick={() => onRemoveCard(i)}
              className={cn(
                "group relative flex items-center justify-center",
                "h-10 w-10 rounded-lg",
                "font-mono text-base font-bold",
                "transition-all duration-150",
                "border-2 cursor-pointer",
                isPlayer
                  ? "bg-player/15 border-player text-player"
                  : "bg-banker/15 border-banker text-banker"
              )}
            >
              {card}
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3" />
              </span>
            </button>
          ))
        )}
      </div>

      {/* Card selection grid */}
      <div className="grid grid-cols-5 gap-2">
        {CARD_LABELS.map((card) => (
          <CardButton
            key={card}
            label={card}
            onClick={() => onAddCard(card)}
            disabled={cards.length >= maxCards}
          />
        ))}
      </div>
    </div>
  )
}
