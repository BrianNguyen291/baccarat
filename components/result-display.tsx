"use client"

import { cn } from "@/lib/utils"
import { Copy, Check, TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ResultDisplayProps {
  totalScore: number
  recommendation: "banker" | "player" | null
  playerCards: string[]
  bankerCards: string[]
}

export function ResultDisplay({
  totalScore,
  recommendation,
  playerCards,
  bankerCards,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false)

  const hasResult = recommendation !== null

  const handleCopy = async () => {
    if (!hasResult) return
    const text = `百家樂計算結果\n閒家牌面：${playerCards.join(", ")}\n莊家牌面：${bankerCards.join(", ")}\n加總分數：${totalScore}\n建議：${recommendation === "banker" ? "莊" : "閒"}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("已複製結果")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all duration-300",
        !hasResult && "border-border bg-card",
        recommendation === "banker" &&
          "border-banker bg-banker/5",
        recommendation === "player" &&
          "border-player bg-player/5"
      )}
    >
      {/* Score */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          加總分數
        </span>
        <span
          className={cn(
            "font-mono text-5xl font-black tracking-tight transition-colors",
            !hasResult && "text-muted-foreground",
            recommendation === "banker" && "text-banker",
            recommendation === "player" && "text-player"
          )}
        >
          {hasResult ? (totalScore >= 0 ? `+${totalScore}` : totalScore) : "—"}
        </span>
      </div>

      {/* Recommendation */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          下一局建議
        </span>
        {hasResult ? (
          <div
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-xl",
              recommendation === "banker"
                ? "bg-banker text-white"
                : "bg-player text-white"
            )}
          >
            {recommendation === "banker" ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {recommendation === "banker" ? "莊" : "閒"}
          </div>
        ) : (
          <div className="px-6 py-2 rounded-lg bg-secondary text-muted-foreground font-bold text-xl">
            等待輸入
          </div>
        )}
      </div>

      {/* Copy button */}
      {hasResult && (
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-secondary text-secondary-foreground",
            "hover:bg-primary hover:text-primary-foreground",
            "transition-all duration-150 text-sm font-medium cursor-pointer"
          )}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              已複製
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              複製結果
            </>
          )}
        </button>
      )}
    </div>
  )
}
