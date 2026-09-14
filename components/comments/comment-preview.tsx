import { UserAvatar } from "@/components/shell/user-avatar"
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

export function CommentPreviewSkeleton() {
  return (
    <div className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-3">
      <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
      <div className="h-4 w-9/12 animate-pulse rounded bg-muted" />
    </div>
  )
}
