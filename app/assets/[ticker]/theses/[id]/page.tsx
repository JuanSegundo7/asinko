"use client"

import { useParams } from "next/navigation"
import { ThesisDetail } from "@/components/content/thesis-detail"

/** Página completa de detalle (D2): entrada directa por URL, refresh, o cuando la interceptación no aplica. */
export default function ThesisDetailPage() {
  const { ticker, id } = useParams<{ ticker: string; id: string }>()
  return <ThesisDetail id={id} ticker={ticker} variant="page" />
}
