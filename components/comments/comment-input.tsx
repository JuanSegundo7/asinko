"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAddCommentMutation } from "@/lib/queries"
import type { CommentSort } from "@/lib/types"

export function CommentInput({ contentId, sort }: { contentId: string; sort: CommentSort }) {
  const [body, setBody] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mutation = useAddCommentMutation()

  useEffect(() => {
    if (window.location.hash === "#comentarios") {
      textareaRef.current?.focus()
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    mutation.mutate({ contentId, body: trimmed, sort })
    setBody("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="comment-input" className="sr-only">
        Escribir un comentario
      </label>
      <textarea
        id="comment-input"
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Sumá tu comentario…"
        rows={2}
        className="w-full resize-none rounded-md border border-border bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      />
      <Button type="submit" disabled={!body.trim() || mutation.isPending} className="min-h-11 self-end">
        {mutation.isPending ? "Publicando…" : "Comentar"}
      </Button>
    </form>
  )
}
