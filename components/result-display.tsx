"use client"

import { cn } from "@/lib/utils"
import { Copy, Check, TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ResultDisplayProps {
  totalScore: number
  recommendation: "banker" | "player" | null
  roundWinner: "player" | "banker" | "tie" | null
  playerCards: string[]
  bankerCards: string[]
}

export function ResultDisplay({
  totalScore,
  recommendation,
  roundWinner,
  playerCards,
  bankerCards,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false)

  const hasResult = recommendation !== null
  const strength = Math.abs(totalScore)
  const confidence =
    strength >= 40 ? "高" : strength >= 20 ? "中" : "低"

  const handleCopy = async () => {
    if (!hasResult) return
    const text = `百家樂計算結果\n閒家牌面：${playerCards.join(", ")}\n莊家牌面：${bankerCards.join(", ")}\n本局勝方：${
      roundWinner === "tie" ? "和" : roundWinner === "banker" ? "莊" : "閒"
    }\n加總分數：${totalScore}\n下局建議：${recommendation === "banker" ? "莊" : "閒"}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("已複製結果")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-300",
        !hasResult && "border-border bg-card",
        recommendation === "banker" &&
          "border-banker bg-gradient-to-br from-banker/10 via-card to-card",
        recommendation === "player" &&
          "border-player bg-gradient-to-br from-player/10 via-card to-card"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-center">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Recommendation
            </p>
            {roundWinner && (
              <div className="mt-2 text-sm text-muted-foreground">
                本局勝方：
                <span
                  className={cn(
                    "ml-1 font-bold",
                    roundWinner === "tie" && "text-amber-400",
                    roundWinner === "banker" && "text-banker",
                    roundWinner === "player" && "text-player"
                  )}
                >
                  {roundWinner === "tie"
                    ? "和"
                    : roundWinner === "banker"
                      ? "莊"
                      : "閒"}
                </span>
              </div>
            )}
            {hasResult ? (
              <div
                className={cn(
                  "mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-2xl font-black",
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
                下一局：{recommendation === "banker" ? "莊" : "閒"}
              </div>
            ) : (
              <div className="mt-2 inline-flex px-4 py-2 rounded-lg bg-secondary text-muted-foreground font-bold">
                等待合法局面
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            閒：<span className="font-mono text-foreground">{playerCards.join(" ") || "—"}</span>
            <span className="mx-2">|</span>
            莊：<span className="font-mono text-foreground">{bankerCards.join(" ") || "—"}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-muted-foreground">加總分數</div>
          <div
            className={cn(
              "font-mono text-5xl font-black tracking-tight leading-none",
              !hasResult && "text-muted-foreground",
              recommendation === "banker" && "text-banker",
              recommendation === "player" && "text-player"
            )}
          >
            {hasResult ? (totalScore >= 0 ? `+${totalScore}` : totalScore) : "—"}
          </div>
          {hasResult && (
            <div className="text-xs text-muted-foreground">
              訊號強度：<span className="font-semibold text-foreground">{confidence}</span>
            </div>
          )}
        </div>
      </div>

      {hasResult && (
        <button
          onClick={handleCopy}
          className={cn(
            "mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg",
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
