"use client"

import { cn } from "@/lib/utils"
import { RotateCcw, Settings } from "lucide-react"
import { useState } from "react"

const CARD_LABELS = ["0", "A", "2", "3", "4", "5", "6", "7", "8", "9"]
const CARD_DESCRIPTIONS = [
  "10/J/Q/K",
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
]

export const DEFAULT_WEIGHTS: Record<string, number> = {
  "0": 1,
  A: 4,
  "2": 6,
  "3": 9,
  "4": 19,
  "5": -12,
  "6": -18,
  "7": -12,
  "8": -6,
  "9": -1,
}

interface WeightEditorProps {
  weights: Record<string, number>
  onWeightChange: (card: string, value: number) => void
  onReset: () => void
}

export function WeightEditor({
  weights,
  onWeightChange,
  onReset,
}: WeightEditorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            權重設定
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {isOpen ? "收起" : "展開"}
        </span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            {CARD_LABELS.map((card, i) => (
              <div
                key={card}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background"
              >
                <span className="font-mono text-sm font-bold text-foreground w-16 shrink-0">
                  {card}{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    {CARD_DESCRIPTIONS[i]}
                  </span>
                </span>
                <input
                  type="number"
                  value={weights[card]}
                  onChange={(e) =>
                    onWeightChange(card, parseInt(e.target.value) || 0)
                  }
                  className={cn(
                    "w-full h-8 px-2 rounded-md text-right font-mono text-sm",
                    "bg-input border border-border text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    weights[card] >= 0
                      ? "text-primary"
                      : "text-destructive"
                  )}
                />
              </div>
            ))}
          </div>
          <button
            onClick={onReset}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2 rounded-lg",
              "bg-secondary text-secondary-foreground",
              "hover:bg-destructive/20 hover:text-destructive",
              "transition-all duration-150 text-sm font-medium cursor-pointer"
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重設為預設值
          </button>
        </div>
      )}
    </div>
  )
}
