"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "cn"
import { useCameFromFeed } from "@/lib/scroll-restoration"

/** "← NVDA" del detalle (D2). Si se llegó clickeando una card en esta sesión usa router.back() (restaura scroll nativo); si es una entrada directa por URL cae a un <Link> plano. */
export function BackLink({ href, label, className }: { href: string; label: string; className?: string }) {
  const router = useRouter()
  const canGoBack = useCameFromFeed()

  const content = (
    <>
      <ArrowLeft className="size-4" aria-hidden="true" />
      {label}
    </>
  )

  const sharedClassName = cn(
    "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground",
    className
  )

  if (canGoBack) {
    return (
      <button type="button" onClick={() => router.back()} className={sharedClassName}>
        {content}
      </button>
    )
  }

  return (
    <Link href={href} className={sharedClassName}>
      {content}
    </Link>
  )
}
