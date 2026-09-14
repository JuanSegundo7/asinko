"use client"

import { useParams } from "next/navigation"
import { PostDetail } from "@/components/content/post-detail"

/** Página completa de detalle (D2): entrada directa por URL, refresh, o cuando la interceptación no aplica. */
export default function PostDetailPage() {
  const { ticker, id } = useParams<{ ticker: string; id: string }>()
  return <PostDetail id={id} ticker={ticker} variant="page" />
}
