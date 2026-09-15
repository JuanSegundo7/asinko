"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAddCommentMutation } from "@/lib/queries"
import type { CommentSort } from "@/lib/types"

/**
 * Input de comentario, reutilizado también para respuestas inline (`parentId`): un top-level
 * comment abre este mismo componente debajo suyo al tocar "Responder" (comment-item.tsx). El `id`
 * del textarea tiene que ser único por instancia — puede haber varias respuestas abiertas a la vez
 * en la misma página, y un `id` duplicado rompe el `htmlFor` del label.
 */
export function CommentInput({
  contentId,
  sort,
  parentId = null,
  autoFocus = false,
  placeholder = "Add your comment…",
  onPosted,
}: {
  contentId: string
  sort: CommentSort
  parentId?: string | null
  autoFocus?: boolean
  placeholder?: string
  onPosted?: () => void
}) {
  const [body, setBody] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mutation = useAddCommentMutation()
  const inputId = parentId ? `comment-input-${parentId}` : "comment-input"

  useEffect(() => {
    if (autoFocus || window.location.hash === "#comments") {
      textareaRef.current?.focus()
    }
    // Solo al montar: es el foco inicial (hash al abrir el detalle, o revelar el input de respuesta).
  }, [autoFocus])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    mutation.mutate({ contentId, body: trimmed, sort, parentId })
    setBody("")
    onPosted?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor={inputId} className="sr-only">
        {parentId ? "Write a reply" : "Write a comment"}
      </label>
      <textarea
        id={inputId}
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-md border border-border bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      />
      <Button type="submit" disabled={!body.trim() || mutation.isPending} className="min-h-11 self-end">
        {mutation.isPending ? "Posting…" : parentId ? "Reply" : "Comment"}
      </Button>
    </form>
  )
}
