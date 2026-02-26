"use client"

import { cn } from "@/lib/utils"
import { History, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface HistoryRecord {
  id: number
  playerCards: string[]
  bankerCards: string[]
  roundWinner: "player" | "banker" | "tie"
  score: number
  rollingSum6: number | null
  recommendation: "banker" | "player" | null
  timestamp: Date
}

interface HistoryPanelProps {
  records: HistoryRecord[]
  onClear: () => void
}

export function HistoryPanel({ records, onClear }: HistoryPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            歷史紀錄
          </span>
          <span className="text-xs text-muted-foreground">
            ({records.length}/100)
          </span>
        </div>
        {records.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清除全部
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          尚無紀錄
        </div>
      ) : (
        <ScrollArea className="h-[320px]">
          <div className="flex flex-col gap-2 pr-3">
            {records.map((record, i) => (
              <div
                key={record.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "bg-background border border-border",
                  "transition-colors"
                )}
              >
                {/* Round number */}
                <span className="text-xs text-muted-foreground font-mono w-6 shrink-0 text-right">
                  #{records.length - i}
                </span>

                {/* Cards info */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-player font-semibold">
                      {"閒"}
                    </span>
                    <span className="font-mono text-foreground">
                      {record.playerCards.join(" ")}
                    </span>
                    <span className="text-muted-foreground mx-1">|</span>
                    <span className="text-banker font-semibold">
                      {"莊"}
                    </span>
                    <span className="font-mono text-foreground">
                      {record.bankerCards.join(" ")}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <span
                  className={cn(
                    "font-mono text-sm font-bold shrink-0",
                    record.score >= 0 ? "text-banker" : "text-player"
                  )}
                >
                  {record.score >= 0 ? `+${record.score}` : record.score}
                </span>

                {/* Recommendation badge */}
                <span
                  className={cn(
                    "shrink-0 px-2 py-0.5 rounded text-xs font-bold",
                    record.roundWinner === "tie" &&
                      "bg-amber-500/15 text-amber-400",
                    record.roundWinner === "banker" &&
                      "bg-banker/15 text-banker",
                    record.roundWinner === "player" &&
                      "bg-player/15 text-player"
                  )}
                >
                  {record.roundWinner === "tie"
                    ? "和"
                    : record.roundWinner === "banker"
                      ? "本局莊"
                      : "本局閒"}
                </span>

                {record.recommendation ? (
                  <span
                    className={cn(
                      "shrink-0 px-2 py-0.5 rounded text-xs font-bold",
                      record.recommendation === "banker"
                        ? "bg-banker/15 text-banker"
                        : "bg-player/15 text-player"
                    )}
                  >
                    Sum6 {record.rollingSum6 !== null && record.rollingSum6 >= 0 ? "+" : ""}
                    {record.rollingSum6 ?? "—"} 下局{record.recommendation === "banker" ? "莊" : "閒"}
                  </span>
                ) : (
                  <span className="shrink-0 px-2 py-0.5 rounded text-xs font-bold bg-secondary text-muted-foreground">
                    未滿6局
                  </span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
