import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const CARD_LABELS = ["0", "A", "2", "3", "4", "5", "6", "7", "8", "9"] as const

const DEFAULT_WEIGHTS: Record<string, number> = {
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

type PersistedSettings = {
  weights: Record<string, number>
  simulation: {
    decks: number
    iterations: number
  }
  updatedAt: string
}

const SETTINGS_KEY = process.env.BACCARAT_SETTINGS_KEY ?? "baccarat:settings:default"

function parseWeights(input: unknown): Record<string, number> {
  const output: Record<string, number> = { ...DEFAULT_WEIGHTS }
  if (!input || typeof input !== "object") {
    return output
  }

  for (const label of CARD_LABELS) {
    const raw = (input as Record<string, unknown>)[label]
    if (typeof raw === "number" && Number.isFinite(raw)) {
      output[label] = Math.trunc(raw)
    }
  }
  return output
}

function parseSimulation(input: unknown): { decks: number; iterations: number } {
  const data = (input && typeof input === "object"
    ? input
    : {}) as Record<string, unknown>
  const decksRaw = typeof data.decks === "number" ? data.decks : 8
  const iterationsRaw = typeof data.iterations === "number" ? data.iterations : 20000

  return {
    decks: Math.max(1, Math.min(12, Math.trunc(decksRaw))),
    iterations: Math.max(100, Math.min(200000, Math.trunc(iterationsRaw))),
  }
}

export async function GET() {
  try {
    const redis = Redis.fromEnv()
    const stored = await redis.get<PersistedSettings | null>(SETTINGS_KEY)
    if (!stored) {
      return NextResponse.json({ settings: null }, { status: 200 })
    }

    return NextResponse.json(
      {
        settings: {
          weights: parseWeights(stored.weights),
          simulation: parseSimulation(stored.simulation),
          updatedAt: stored.updatedAt ?? new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load settings", detail: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<PersistedSettings>
    const payload: PersistedSettings = {
      weights: parseWeights(body.weights),
      simulation: parseSimulation(body.simulation),
      updatedAt: new Date().toISOString(),
    }

    const redis = Redis.fromEnv()
    await redis.set(SETTINGS_KEY, payload)

    return NextResponse.json({ ok: true, settings: payload }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings", detail: String(error) },
      { status: 500 }
    )
  }
}

