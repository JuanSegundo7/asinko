import { BackLink } from "./back-link"

export function NotFoundPanel({
  message,
  backHref,
  backLabel,
}: {
  message: string
  backHref: string
  backLabel: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-muted-foreground">{message}</p>
      <BackLink href={backHref} label={backLabel} />
    </div>
  )
}
