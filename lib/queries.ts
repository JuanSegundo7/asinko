import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  addComment,
  getAsset,
  getAssetContent,
  getComments,
  getCommentPreview,
  getExchangeRates,
  getPost,
  getPriceHistory,
  getTheses,
  getThesis,
  voteComment,
  voteContent,
} from "./api"
import { MOCK_NOW } from "./format"
import { toggleVote } from "./vote"
import type {
  CommentSort,
  CommentWithReplies,
  Post,
  Thesis,
  ThesisStatus,
  VoteDirection,
} from "./types"

export const queryKeys = {
  asset: (ticker: string) => ["asset", ticker] as const,
  content: (ticker: string) => ["content", ticker] as const,
  post: (id: string) => ["post", id] as const,
  thesis: (id: string) => ["thesis", id] as const,
  theses: (ticker: string, status?: ThesisStatus) =>
    ["theses", ticker, status ?? "all"] as const,
  comments: (contentId: string, sort: CommentSort) =>
    ["comments", contentId, sort] as const,
  commentPreview: (contentId: string) => ["commentPreview", contentId] as const,
  exchangeRates: () => ["exchangeRates"] as const,
  priceHistory: (ticker: string) => ["priceHistory", ticker] as const,
}

type AssetContent = { posts: Post[]; theses: Thesis[] }
/** `totalTopLevel` alimenta "Ver N más" (paginación de primer nivel); `totalAll` alimenta el header "Comentarios (N)" (primer nivel + respuestas). Ver `getComments` en lib/api.ts. */
type CommentsPage = { items: CommentWithReplies[]; totalTopLevel: number; totalAll: number }

export function useAssetQuery(ticker: string) {
  return useQuery({
    queryKey: queryKeys.asset(ticker),
    queryFn: () => getAsset(ticker),
  })
}

export function useAssetContentQuery(ticker: string) {
  return useQuery({
    queryKey: queryKeys.content(ticker),
    queryFn: () => getAssetContent(ticker),
  })
}

export function usePostQuery(id: string) {
  return useQuery({ queryKey: queryKeys.post(id), queryFn: () => getPost(id) })
}

export function useThesisQuery(id: string) {
  return useQuery({ queryKey: queryKeys.thesis(id), queryFn: () => getThesis(id) })
}

export function useThesesQuery(ticker: string, status?: ThesisStatus) {
  return useQuery({
    queryKey: queryKeys.theses(ticker, status),
    queryFn: () => getTheses(ticker, status),
  })
}

export function useExchangeRatesQuery() {
  return useQuery({
    queryKey: queryKeys.exchangeRates(),
    queryFn: getExchangeRates,
    staleTime: Infinity,
  })
}

export function usePriceHistoryQuery(ticker: string) {
  return useQuery({
    queryKey: queryKeys.priceHistory(ticker),
    queryFn: () => getPriceHistory(ticker),
    staleTime: Infinity,
  })
}

export function useCommentPreviewQuery(contentId: string) {
  return useQuery({
    queryKey: queryKeys.commentPreview(contentId),
    queryFn: () => getCommentPreview(contentId),
  })
}

export function useCommentsInfiniteQuery(
  contentId: string,
  sort: CommentSort,
  pageSize = 5
) {
  return useInfiniteQuery({
    queryKey: queryKeys.comments(contentId, sort),
    queryFn: ({ pageParam }) =>
      getComments(contentId, { offset: pageParam, limit: pageSize, sort }),
    initialPageParam: 0,
    // El offset pagina sobre comentarios de PRIMER NIVEL: cada `item` cargado ya trae sus respuestas
    // adentro (no pesan en este conteo), así que `loaded` tiene que contar `items`, no respuestas.
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0)
      return loaded < lastPage.totalTopLevel ? loaded : undefined
    },
  })
}

type VoteContentVars = { id: string; assetTicker: string; direction: VoteDirection }

/** Voto optimista sobre un posteo o tesis, sincronizado entre la card (['content', ticker]) y el detalle (['post'|'thesis', id]). No aplica el optimistic update sobre una tesis CLOSED (D1: votos congelados). */
export function useVoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, direction }: VoteContentVars) => voteContent(id, direction),
    onMutate: async ({ id, assetTicker, direction }: VoteContentVars) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.post(id) }),
        queryClient.cancelQueries({ queryKey: queryKeys.thesis(id) }),
        queryClient.cancelQueries({ queryKey: queryKeys.content(assetTicker) }),
      ])

      const prevPost = queryClient.getQueryData<Post | null>(queryKeys.post(id))
      const prevThesis = queryClient.getQueryData<Thesis | null>(queryKeys.thesis(id))
      const prevContent = queryClient.getQueryData<AssetContent | null>(
        queryKeys.content(assetTicker)
      )
      const thesisIsOpen = !prevThesis || prevThesis.status === "OPEN"

      if (prevPost) {
        queryClient.setQueryData(queryKeys.post(id), toggleVote(prevPost, direction))
      }
      if (prevThesis && thesisIsOpen) {
        queryClient.setQueryData(queryKeys.thesis(id), toggleVote(prevThesis, direction))
      }
      if (prevContent && thesisIsOpen) {
        queryClient.setQueryData<AssetContent>(queryKeys.content(assetTicker), {
          posts: prevContent.posts.map((p) => (p.id === id ? toggleVote(p, direction) : p)),
          theses: prevContent.theses.map((t) => (t.id === id ? toggleVote(t, direction) : t)),
        })
      }

      return { prevPost, prevThesis, prevContent, assetTicker, id }
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      queryClient.setQueryData(queryKeys.post(ctx.id), ctx.prevPost)
      queryClient.setQueryData(queryKeys.thesis(ctx.id), ctx.prevThesis)
      queryClient.setQueryData(queryKeys.content(ctx.assetTicker), ctx.prevContent)
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post(vars.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.thesis(vars.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.content(vars.assetTicker) })
    },
  })
}

type VoteCommentVars = { id: string; contentId: string; direction: VoteDirection }

/** Voto optimista sobre un comentario. Actualiza todas las variantes de sort cacheadas (TOP y RECENT) sin invalidar a mitad de scroll. */
export function useVoteCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, direction }: VoteCommentVars) => voteComment(id, direction),
    onMutate: async ({ id, contentId, direction }: VoteCommentVars) => {
      await queryClient.cancelQueries({ queryKey: ["comments", contentId] })
      const previous = queryClient.getQueriesData({ queryKey: ["comments", contentId] })

      queryClient.setQueriesData(
        { queryKey: ["comments", contentId] },
        (data: { pages: CommentsPage[]; pageParams: number[] } | undefined) => {
          if (!data) return data
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              // El voto puede caer en un comentario de primer nivel o en una de sus respuestas
              // (threading de un solo nivel: nunca más profundo que eso).
              items: page.items.map((c) => {
                if (c.id === id) return toggleVote(c, direction)
                const replyIndex = c.replies.findIndex((r) => r.id === id)
                if (replyIndex === -1) return c
                const replies = [...c.replies]
                replies[replyIndex] = toggleVote(replies[replyIndex], direction)
                return { ...c, replies }
              }),
            })),
          }
        }
      )

      return { previous, contentId }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["comments", vars.contentId] })
    },
  })
}

type AddCommentVars = {
  contentId: string
  body: string
  sort: CommentSort
  /** Si viene seteado, es una respuesta a ESE comentario de primer nivel (nunca a otra respuesta). */
  parentId?: string | null
}

/**
 * Alta optimista de comentario o respuesta (D3 + threading de un solo nivel):
 * - Top-level: aparece arriba de la primera página visible, sea cual sea el sort activo.
 * - Respuesta: se busca su padre en TODAS las páginas cargadas y se le agrega al final de `replies`.
 * En ambos casos se suma 1 a `totalAll` en todas las páginas (así el header "Comentarios (N)" nunca
 * queda desactualizado, aunque el padre de una respuesta viva en una página distinta de la primera)
 * y 1 a `totalTopLevel` solo cuando es top-level.
 */
export function useAddCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contentId, body, parentId }: AddCommentVars) =>
      addComment(contentId, body, parentId ?? null),
    onMutate: async ({ contentId, body, sort, parentId = null }: AddCommentVars) => {
      const key = queryKeys.comments(contentId, sort)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<{
        pages: CommentsPage[]
        pageParams: number[]
      }>(key)

      const optimisticComment: CommentWithReplies = {
        id: `optimistic-${crypto.randomUUID()}`,
        contentId,
        parentId,
        author: { handle: "vos" },
        body,
        createdAt: MOCK_NOW.toISOString(),
        upvotes: 0,
        downvotes: 0,
        userVote: null,
        replies: [],
      }

      queryClient.setQueryData(key, (data: typeof previous) => {
        if (!data) return data

        let attached = false
        const pages = data.pages.map((page, pageIndex) => {
          const totalAll = page.totalAll + 1

          if (parentId) {
            if (attached) return { ...page, totalAll }
            const parentIndex = page.items.findIndex((c) => c.id === parentId)
            if (parentIndex === -1) return { ...page, totalAll }
            attached = true
            const items = [...page.items]
            items[parentIndex] = {
              ...items[parentIndex],
              replies: [...items[parentIndex].replies, optimisticComment],
            }
            return { ...page, items, totalAll }
          }

          const totalTopLevel = page.totalTopLevel + 1
          if (pageIndex === 0) {
            return { ...page, items: [optimisticComment, ...page.items], totalAll, totalTopLevel }
          }
          return { ...page, totalAll, totalTopLevel }
        })

        return { ...data, pages }
      })

      return { previous, contentId, sort, parentId, optimisticId: optimisticComment.id }
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      queryClient.setQueryData(queryKeys.comments(ctx.contentId, ctx.sort), ctx.previous)
    },
    /**
     * Reemplaza el comentario optimista por el real EN EL MISMO LUGAR, en vez de invalidar la
     * lista y dejar que un refetch la reordene por sort — un comentario nuevo tiene 0 votos, así
     * que con sort "Top" un refetch lo manda al final, y el usuario ve su propio comentario
     * aparecer arriba un instante y "saltar" abajo de todo apenas resuelve. D3 dice "el nuevo
     * aparece arriba": eso vale para el resto de la sesión de esta vista, no solo el instante
     * optimista.
     */
    onSuccess: (realComment, _vars, ctx) => {
      if (!ctx) return
      const key = queryKeys.comments(ctx.contentId, ctx.sort)
      queryClient.setQueryData(
        key,
        (data: { pages: CommentsPage[]; pageParams: number[] } | undefined) => {
          if (!data) return data
          const pages = data.pages.map((page) => {
            if (ctx.parentId) {
              const parentIndex = page.items.findIndex((c) => c.id === ctx.parentId)
              if (parentIndex === -1) return page
              const items = [...page.items]
              items[parentIndex] = {
                ...items[parentIndex],
                replies: items[parentIndex].replies.map((r) =>
                  r.id === ctx.optimisticId ? realComment : r
                ),
              }
              return { ...page, items }
            }
            const items = page.items.map((c) =>
              c.id === ctx.optimisticId ? { ...realComment, replies: [] } : c
            )
            return { ...page, items }
          })
          return { ...data, pages }
        }
      )
    },
    onSettled: (_data, _err, vars) => {
      // Ojo: NO se invalida queryKeys.comments acá a propósito (ver onSuccess) — sí el resto,
      // para que "N comentarios" en la card/tracker/actividad quede al día.
      queryClient.invalidateQueries({ queryKey: queryKeys.post(vars.contentId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.thesis(vars.contentId) })
      queryClient.invalidateQueries({ queryKey: ["content"] })
    },
  })
}
