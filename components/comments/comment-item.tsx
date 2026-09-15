"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { VoteControl, VoteControlSkeleton } from "@/components/content/vote-control"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/shell/user-avatar"
import { CommentInput } from "@/components/comments/comment-input"
import { useVoteCommentMutation } from "@/lib/queries"
import { formatAbsoluteFull, formatRelative } from "@/lib/format"
import type { Comment, CommentSort, CommentWithReplies } from "@/lib/types"

/**
 * Entrada sutil al montar (Parte 2): "preventing a jarring change" — un comentario que recién
 * cargó no debería aparecer de golpe. Spring crítico (sin bounce, D-apple: el bounce se reserva
 * para gestos con momentum, esto no es un gesto) + reduced motion → solo fade, sin desplazamiento
 * (mismo patrón que components/detail/detail-panel.tsx).
 */
const ITEM_VARIANTS = {
  hidden: { opacity: 0, transform: "translateY(8px)" },
  visible: { opacity: 1, transform: "translateY(0px)" },
}
const REDUCED_ITEM_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

/** Stagger acotado (30-80ms/ítem): no tiene sentido que el 20vo comentario tarde un segundo en aparecer. */
function staggerDelay(index: number, step = 0.04, max = 6) {
  return Math.min(index, max) * step
}

export function CommentItem({
  comment,
  sort,
  index,
}: {
  comment: CommentWithReplies
  sort: CommentSort
  index: number
}) {
  const voteMutation = useVoteCommentMutation()
  const reducedMotion = useReducedMotion()
  const [replying, setReplying] = useState(false)

  return (
    <motion.li
      variants={reducedMotion ? REDUCED_ITEM_VARIANTS : ITEM_VARIANTS}
      initial="hidden"
      animate="visible"
      transition={
        reducedMotion
          ? { duration: 0.15 }
          : { type: "spring", bounce: 0, duration: 0.3, delay: staggerDelay(index) }
      }
      // Grupo cohesivo (Parte 2): un comentario con respuestas respira más antes/después que uno sin ellas.
      className={cn(
        "border-b border-border py-3 last:border-b-0",
        comment.replies.length > 0 && "pb-4"
      )}
    >
      <div className="flex gap-2.5">
        <UserAvatar handle={comment.author.handle} size={28} className="mt-0.5" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">@{comment.author.handle}</span>
            <time dateTime={comment.createdAt} title={formatAbsoluteFull(comment.createdAt)}>
              {formatRelative(comment.createdAt)}
            </time>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{comment.body}</p>
          <div className="flex items-center gap-1">
            <VoteControl
              size="compact"
              upvotes={comment.upvotes}
              downvotes={comment.downvotes}
              userVote={comment.userVote}
              scoreVariant="signed"
              onVote={(direction) =>
                voteMutation.mutate({ id: comment.id, contentId: comment.contentId, direction })
              }
            />
            {/* Solo comentarios de primer nivel responden — threading de un solo nivel, una respuesta nunca tiene su propio "Responder". */}
            <button
              type="button"
              aria-expanded={replying}
              onClick={() => setReplying((r) => !r)}
              className="press-feedback flex min-h-11 items-center px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Reply
            </button>
          </div>

          {replying && (
            <div className="mt-1">
              <CommentInput
                contentId={comment.contentId}
                sort={sort}
                parentId={comment.id}
                autoFocus
                placeholder={`Reply to @${comment.author.handle}…`}
                onPosted={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <ul className="ml-[38px] mt-3 flex flex-col gap-3 rounded-lg border-l-2 border-border bg-muted/60 py-2.5 pl-3 pr-2.5">
          {comment.replies.map((reply, replyIndex) => (
            <ReplyItem key={reply.id} reply={reply} index={replyIndex} reducedMotion={reducedMotion} />
          ))}
        </ul>
      )}
    </motion.li>
  )
}

/** Respuesta dentro de un hilo: mismo patrón visual que CommentItem pero sin "Responder" (threading de un solo nivel) y avatar más chico, coherente con la jerarquía que ya usa CommentPreview (avatar 20 en preview, 28 en comentario de primer nivel — 24 acá, en el medio). */
function ReplyItem({
  reply,
  index,
  reducedMotion,
}: {
  reply: Comment
  index: number
  reducedMotion: boolean | null
}) {
  const voteMutation = useVoteCommentMutation()

  return (
    <motion.li
      variants={reducedMotion ? REDUCED_ITEM_VARIANTS : ITEM_VARIANTS}
      initial="hidden"
      animate="visible"
      transition={
        reducedMotion
          ? { duration: 0.15 }
          : { type: "spring", bounce: 0, duration: 0.3, delay: staggerDelay(index, 0.03, 4) }
      }
      className="flex gap-2"
    >
      <UserAvatar handle={reply.author.handle} size={24} className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">@{reply.author.handle}</span>
          <time dateTime={reply.createdAt} title={formatAbsoluteFull(reply.createdAt)}>
            {formatRelative(reply.createdAt)}
          </time>
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{reply.body}</p>
        <VoteControl
          size="compact"
          upvotes={reply.upvotes}
          downvotes={reply.downvotes}
          userVote={reply.userVote}
          scoreVariant="signed"
          onVote={(direction) =>
            voteMutation.mutate({ id: reply.id, contentId: reply.contentId, direction })
          }
        />
      </div>
    </motion.li>
  )
}

/** Calca la forma real de `CommentItem`: avatar 28px + handle/tiempo, cuerpo, fila de voto compacta. */
export function CommentItemSkeleton() {
  return (
    <li className="flex gap-2.5 border-b border-border py-3 last:border-b-0">
      <Skeleton className="mt-0.5 size-7 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <VoteControlSkeleton size="compact" />
      </div>
    </li>
  )
}
