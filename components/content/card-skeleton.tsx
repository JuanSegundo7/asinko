import { SquircleSurface } from "@/components/ui/squircle-surface"
import { Skeleton } from "@/components/ui/skeleton"
import { CommentPreviewSkeleton } from "@/components/comments/comment-preview"
import { VoteControlSkeleton } from "./vote-control"
import { ThesisDataGridSkeleton } from "./thesis-data-grid"

/**
 * Skeleton de card mientras cargan posts/tesis (feed y listado de tesis). Reconstruido para
 * calcar la forma REAL de `PostCard`/`ThesisCard` (mismo `SquircleSurface`, mismos breakpoints,
 * mismo padding) en vez de una card gris genérica — así el "pop" de esquinas al terminar de
 * cargar no se nota (D10: esquinas squircle reales, no `border-radius`).
 */
export function CardSkeleton({ variant }: { variant: "post" | "thesis" }) {
  return variant === "thesis" ? <ThesisCardSkeleton /> : <PostCardSkeleton />
}

function PostCardSkeleton() {
  return (
    <SquircleSurface as="article" cornerRadius={20} elevation={1} className="p-5">
      <header className="flex items-center gap-2">
        <Skeleton className="size-7 shrink-0 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-10" />
      </header>

      {/* 3 líneas: promedio razonable del cuerpo real (los posteos del seed van de ~3 a ~4 líneas).
          No calza al pixel con texto variable — un shift chico de altura al cargar es inevitable y
          aceptable; lo que NO puede pasar es que ese cambio de tamaño rompa la esquina del squircle
          (se recorta el fondo), y eso se resuelve en use-squircle.ts (clip-path imperativo aplicado
          en el mismo frame que el resize), no acá. */}
      <div className="mt-2 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Mismo orden que la card real tras D25: footer de voto/score ANTES del preview de
          comentarios. El skeleton lo tenía invertido, así que al cargar los bloques se reordenaban
          (reflujo interno visible además del cambio de altura). */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <VoteControlSkeleton />
        <Skeleton className="h-4 w-24" />
      </div>

      <CommentPreviewSkeleton />
    </SquircleSurface>
  )
}

function ThesisCardSkeleton() {
  return (
    <SquircleSurface as="article" cornerRadius={20} elevation={1} className="relative @container p-5">
      {/* Acento de estado de ThesisCard (barra de 2px según status) — gris neutro, no se sabe el estado todavía. */}
      <div className="absolute inset-x-5 top-2.5 h-1 rounded-full bg-muted" aria-hidden="true" />

      <header className="flex flex-wrap items-center gap-2">
        <Skeleton className="size-7 shrink-0 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-10" />
      </header>

      {/* Claim: serif grande en la real, se simula con una barra más alta que el texto normal. */}
      <div className="mt-2 flex flex-col gap-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>

      <ThesisDataGridSkeleton className="mt-3" />

      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Mismo orden que ThesisCard tras D25: footer de voto/score antes del preview de comentarios. */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <VoteControlSkeleton />
        <Skeleton className="h-4 w-24" />
      </div>

      <CommentPreviewSkeleton />
    </SquircleSurface>
  )
}
