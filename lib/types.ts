export type Currency = "USD" | "EUR" | "GBP" | "JPY"
export type Conviction = "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
export type ThesisDirection = "ABOVE" | "BELOW" // superará / no superará
export type ThesisStatus = "OPEN" | "CLOSED"
export type ThesisOutcome = "CORRECT" | "INCORRECT"
export type UserVote = "UP" | "DOWN" | null
export type CommentSort = "TOP" | "RECENT"

export type User = {
  handle: string
}

export type Asset = {
  ticker: string // "NVDA"
  name: string // "NVIDIA Corp."
  sector: string // "Semiconductores"
  currency: Currency // moneda nativa: "USD"
  price: number // mock
}

export type Comment = {
  id: string
  contentId: string
  author: User
  body: string
  createdAt: string
  upvotes: number
  downvotes: number
  userVote: UserVote
}

export type BaseContent = {
  id: string
  assetTicker: string
  author: User
  createdAt: string // ISO, relativo a MOCK_NOW
  upvotes: number
  downvotes: number
  userVote: UserVote
  commentCount: number
}

export type Post = BaseContent & {
  type: "POST"
  body: string
}

export type Thesis = BaseContent & {
  type: "THESIS"
  claim: string
  direction: ThesisDirection
  targetPrice: number // en moneda nativa del activo
  deadline: string // fecha puntual ISO
  conviction: Conviction
  reasoning: string
  status: ThesisStatus
  outcome: ThesisOutcome | null
  resolvedAt: string | null
  resolutionPrice: number | null
}

export type Content = Post | Thesis

export type VoteDirection = "UP" | "DOWN"

export type ExchangeRates = Record<Exclude<Currency, "USD">, number>
