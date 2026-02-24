"use client"

import { cn } from "@/lib/utils"

interface CardButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function CardButton({ label, onClick, disabled }: CardButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center",
        "h-12 w-12 rounded-lg",
        "bg-secondary text-secondary-foreground",
        "font-mono text-lg font-bold",
        "transition-all duration-150",
        "hover:bg-primary hover:text-primary-foreground hover:scale-105",
        "active:scale-95",
        "disabled:opacity-40 disabled:pointer-events-none",
        "border border-border",
        "cursor-pointer"
      )}
    >
      {label}
    </button>
  )
}
