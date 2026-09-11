import { formatAbsolute, formatCurrency } from "@/lib/format"
import { getConsensus, getConsensusMismatchLabel } from "@/lib/consensus"
import type { Thesis } from "@/lib/types"

/** D1: en una tesis cerrada se muestran las dos dimensiones por separado — lo que creyó la comunidad (consenso) y lo que pasó en la realidad (resultado) — y se deriva un badge solo cuando difieren. */
export function ConsensusVsOutcome({ thesis }: { thesis: Thesis }) {
  if (thesis.status !== "CLOSED" || !thesis.outcome || !thesis.resolvedAt) return null

  const consensus = getConsensus(thesis)
  const outcomeIsCorrect = thesis.outcome === "CORRECT"
  const mismatchLabel = getConsensusMismatchLabel(thesis)

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <Row
        label="Consenso de la comunidad"
        value={consensus === "FOR" ? "A favor" : "En contra"}
      />
      <Row
        label="Resultado"
        value={`${outcomeIsCorrect ? "Acertó" : "Falló"} — cerró en ${formatCurrency(
          thesis.resolutionPrice ?? 0,
          "USD"
        )} el ${formatAbsolute(thesis.resolvedAt)}`}
      />
      {mismatchLabel && (
        <p className="border-t border-border pt-2 font-medium text-foreground">{mismatchLabel}</p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
