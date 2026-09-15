import { UserAvatar } from "@/components/shell/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { Comment } from "@/lib/types"

export function CommentPreview({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return null

  return (
    <ul className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-3 text-sm">
      {comments.map((comment) => (
        <li key={comment.id} className="flex items-start gap-1.5">
          <UserAvatar handle={comment.author.handle} size={20} className="mt-0.5" />
          <p className="line-clamp-2 text-muted-foreground">
            <span className="font-medium text-foreground">@{comment.author.handle}</span>{" "}
            {comment.body}
          </p>
        </li>
      ))}
    </ul>
  )
}

/** Calca la forma real de `CommentPreview`: avatar 20px + línea de texto, por cada comentario de preview. */
export function CommentPreviewSkeleton() {
  return (
    <ul className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-3">
      {[0, 1].map((i) => (
        <li key={i} className="flex items-start gap-1.5">
          <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </li>
      ))}
    </ul>
  )
}
