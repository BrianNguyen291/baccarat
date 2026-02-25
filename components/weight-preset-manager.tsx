"use client"

import { cn } from "@/lib/utils"
import { Download, Save, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type PresetItem = {
  name: string
  weights: Record<string, number>
  updatedAt: string
}

interface WeightPresetManagerProps {
  weights: Record<string, number>
  onApplyPreset: (weights: Record<string, number>) => void
}

const STORAGE_KEY = "baccarat-weight-presets-v1"

export function WeightPresetManager({
  weights,
  onApplyPreset,
}: WeightPresetManagerProps) {
  const [name, setName] = useState("")
  const [selected, setSelected] = useState("")
  const [presets, setPresets] = useState<PresetItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as PresetItem[]
      if (Array.isArray(parsed)) {
        setPresets(parsed)
      }
    } catch {
      // ignore malformed local data
    }
  }, [])

  const sortedPresets = useMemo(
    () => [...presets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [presets]
  )

  const persist = (next: PresetItem[]) => {
    setPresets(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("請先輸入 Preset 名稱")
      return
    }

    const next = [...presets]
    const idx = next.findIndex((p) => p.name === trimmed)
    const payload: PresetItem = {
      name: trimmed,
      weights: { ...weights },
      updatedAt: new Date().toISOString(),
    }
    if (idx >= 0) {
      next[idx] = payload
    } else {
      next.push(payload)
    }
    persist(next)
    setSelected(trimmed)
    toast.success("Preset 已儲存")
  }

  const handleApply = () => {
    if (!selected) return
    const target = presets.find((p) => p.name === selected)
    if (!target) return
    onApplyPreset(target.weights)
    toast.success(`已套用 Preset：${target.name}`)
  }

  const handleDelete = () => {
    if (!selected) return
    const next = presets.filter((p) => p.name !== selected)
    persist(next)
    setSelected("")
    toast.success("Preset 已刪除")
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">權重 Presets</h3>
        <span className="text-xs text-muted-foreground">Local</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：新版權重A"
          className="h-9 rounded-md border border-border bg-input px-3 text-sm"
        />
        <button
          onClick={handleSave}
          className={cn(
            "h-9 px-3 rounded-md text-sm font-semibold",
            "bg-secondary text-secondary-foreground hover:opacity-90",
            "flex items-center justify-center gap-1.5 cursor-pointer"
          )}
        >
          <Save className="h-3.5 w-3.5" />
          存成 Preset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="h-9 rounded-md border border-border bg-input px-3 text-sm"
        >
          <option value="">選擇 Preset</option>
          {sortedPresets.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleApply}
          disabled={!selected}
          className={cn(
            "h-9 px-3 rounded-md text-sm font-semibold",
            selected
              ? "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            套用
          </span>
        </button>
        <button
          onClick={handleDelete}
          disabled={!selected}
          className={cn(
            "h-9 px-3 rounded-md text-sm font-semibold",
            selected
              ? "bg-secondary text-secondary-foreground hover:text-destructive cursor-pointer"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            刪除
          </span>
        </button>
      </div>
    </div>
  )
}

