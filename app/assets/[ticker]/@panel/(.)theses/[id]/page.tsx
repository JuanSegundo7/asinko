"use client"

import { useParams } from "next/navigation"
import { DetailPanel } from "@/components/detail/detail-panel"
import { ThesisDetail } from "@/components/content/thesis-detail"

/** D2: versión interceptada del detalle de tesis. Ver posts/[id] para el razonamiento (misma convención). */
export default function InterceptedThesisPanel() {
  const { ticker, id } = useParams<{ ticker: string; id: string }>()

  return (
    <DetailPanel>
      <ThesisDetail id={id} ticker={ticker} variant="panel" />
    </DetailPanel>
  )
}
