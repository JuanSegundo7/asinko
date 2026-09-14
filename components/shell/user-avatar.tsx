import Image from "next/image"
import { cn } from "cn"
import { getAvatarSrc } from "@/lib/avatars"

/** D13: foto real si el handle tiene una mapeada (`lib/avatars.ts`); si no (ej. `@demo`), círculo con inicial. */
export function UserAvatar({
  handle,
  className,
  size = 32,
}: {
  handle: string
  className?: string
  size?: number
}) {
  const src = getAvatarSrc(handle)

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground",
        className
      )}
      aria-hidden="true"
    >
      {handle.charAt(0).toUpperCase()}
    </div>
  )
}
