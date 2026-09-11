import type { Comment } from "@/lib/types"

export function CommentPreview({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return null

  return (
    <ul className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
      {comments.map((comment) => (
        <li key={comment.id} className="line-clamp-2 text-muted-foreground">
          <span className="font-medium text-foreground">@{comment.author.handle}</span>{" "}
          {comment.body}
        </li>
      ))}
    </ul>
  )
}

export function CommentPreviewSkeleton() {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
      <div className="h-4 w-9/12 animate-pulse rounded bg-muted" />
    </div>
  )
}
