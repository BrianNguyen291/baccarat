export type Side = "player" | "banker"

export type RoundValidation =
  | { status: "incomplete"; message: string }
  | { status: "invalid"; message: string }
  | { status: "valid"; message: string }

export function getPoint(card: string) {
  if (card === "0") return 0
  if (card === "A") return 1
  return Number(card)
}

export function twoCardTotal(cards: string[]) {
  return (getPoint(cards[0]) + getPoint(cards[1])) % 10
}

export function bankerShouldDraw(bankerTotal: number, playerThirdCard: string) {
  const playerThirdPoint = getPoint(playerThirdCard)
  if (bankerTotal <= 2) return true
  if (bankerTotal === 3) return playerThirdPoint !== 8
  if (bankerTotal === 4) return playerThirdPoint >= 2 && playerThirdPoint <= 7
  if (bankerTotal === 5) return playerThirdPoint >= 4 && playerThirdPoint <= 7
  if (bankerTotal === 6) return playerThirdPoint === 6 || playerThirdPoint === 7
  return false
}

type NextStep =
  | { status: "need_card"; side: Side; message: string }
  | { status: "complete"; message: string }
  | { status: "invalid"; message: string }

export function getNextStep(playerCards: string[], bankerCards: string[]): NextStep {
  const pLen = playerCards.length
  const bLen = bankerCards.length

  if (pLen > 3 || bLen > 3) {
    return { status: "invalid", message: "單邊最多只能輸入 3 張牌" }
  }

  if (pLen === 0 && bLen === 0) {
    return { status: "need_card", side: "player", message: "請先發閒家第 1 張牌" }
  }
  if (pLen === 1 && bLen === 0) {
    return { status: "need_card", side: "banker", message: "請發莊家第 1 張牌" }
  }
  if (pLen === 1 && bLen === 1) {
    return { status: "need_card", side: "player", message: "請發閒家第 2 張牌" }
  }
  if (pLen === 2 && bLen === 1) {
    return { status: "need_card", side: "banker", message: "請發莊家第 2 張牌" }
  }

  if (pLen < 2 || bLen < 2) {
    return { status: "invalid", message: "輸入順序錯誤，請依標準發牌順序" }
  }

  const playerInitial = twoCardTotal(playerCards)
  const bankerInitial = twoCardTotal(bankerCards)
  const hasNatural = playerInitial >= 8 || bankerInitial >= 8

  if (pLen === 2 && bLen === 2) {
    if (hasNatural) {
      return { status: "complete", message: "例牌（8/9），本局結束" }
    }
    if (playerInitial <= 5) {
      return { status: "need_card", side: "player", message: "閒家需補第 3 張牌" }
    }
    if (bankerInitial <= 5) {
      return { status: "need_card", side: "banker", message: "閒家停牌，莊家需補第 3 張牌" }
    }
    return { status: "complete", message: "雙方 6/7 停牌，本局結束" }
  }

  if (hasNatural) {
    return { status: "invalid", message: "例牌（8/9）後不可再補牌" }
  }

  if (pLen === 3 && bLen === 2) {
    if (playerInitial >= 6) {
      return { status: "invalid", message: "閒家起始牌為 6/7，不應補第 3 張" }
    }
    const shouldDraw = bankerShouldDraw(bankerInitial, playerCards[2])
    if (shouldDraw) {
      return { status: "need_card", side: "banker", message: "莊家需補第 3 張牌" }
    }
    return { status: "complete", message: "莊家停牌，本局結束（共 5 張）" }
  }

  if (pLen === 2 && bLen === 3) {
    if (playerInitial <= 5) {
      return { status: "invalid", message: "閒家起始牌 0-5，應先由閒家補第 3 張" }
    }
    if (bankerInitial >= 6) {
      return { status: "invalid", message: "閒家停牌時，莊家起始牌 6/7 不應補牌" }
    }
    return { status: "complete", message: "莊家補第 3 張後本局結束（共 5 張）" }
  }

  if (pLen === 3 && bLen === 3) {
    if (playerInitial >= 6) {
      return { status: "invalid", message: "閒家起始牌為 6/7，不應有第 3 張" }
    }
    if (!bankerShouldDraw(bankerInitial, playerCards[2])) {
      return { status: "invalid", message: "此局莊家不應補第 3 張" }
    }
    return { status: "complete", message: "第 6 張完成，本局結束" }
  }

  return { status: "invalid", message: "輸入順序不合法，請清除後重輸" }
}

export function validateRound(playerCards: string[], bankerCards: string[]): RoundValidation {
  const step = getNextStep(playerCards, bankerCards)
  if (step.status === "invalid") {
    return { status: "invalid", message: step.message }
  }

  const totalCards = playerCards.length + bankerCards.length
  if (step.status === "complete") {
    if (totalCards < 4 || totalCards > 6) {
      return { status: "invalid", message: "每局總牌數需為 4 到 6 張" }
    }
    return { status: "valid", message: step.message }
  }

  if (totalCards < 4) {
    return { status: "incomplete", message: "先完成起始牌 4 張（閒2、莊2）" }
  }
  return { status: "incomplete", message: step.message }
}

export function getLastDealtSide(playerCards: string[], bankerCards: string[]): Side | null {
  const pLen = playerCards.length
  const bLen = bankerCards.length
  if (pLen === 0 && bLen === 0) return null
  if (pLen > bLen) return "player"
  if (bLen > pLen) return "banker"
  return "banker"
}

