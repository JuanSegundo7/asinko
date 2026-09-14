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
  Comment,
  CommentSort,
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
type CommentsPage = { items: Comment[]; total: number }

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
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0)
      return loaded < lastPage.total ? loaded : undefined
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
              items: page.items.map((c) => (c.id === id ? toggleVote(c, direction) : c)),
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

type AddCommentVars = { contentId: string; body: string; sort: CommentSort }

/** Alta optimista de comentario: aparece arriba de la lista visible al instante (D3), independientemente del sort activo. */
export function useAddCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contentId, body }: AddCommentVars) => addComment(contentId, body),
    onMutate: async ({ contentId, body, sort }: AddCommentVars) => {
      const key = queryKeys.comments(contentId, sort)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<{
        pages: CommentsPage[]
        pageParams: number[]
      }>(key)

      const optimisticComment: Comment = {
        id: `optimistic-${crypto.randomUUID()}`,
        contentId,
        author: { handle: "vos" },
        body,
        createdAt: MOCK_NOW.toISOString(),
        upvotes: 0,
        downvotes: 0,
        userVote: null,
      }

      queryClient.setQueryData(key, (data: typeof previous) => {
        if (!data) return data
        const pages = [...data.pages]
        pages[0] = {
          ...pages[0],
          items: [optimisticComment, ...pages[0].items],
          total: pages[0].total + 1,
        }
        return { ...data, pages }
      })

      return { previous, contentId, sort }
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      queryClient.setQueryData(queryKeys.comments(ctx.contentId, ctx.sort), ctx.previous)
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(vars.contentId, vars.sort) })
      queryClient.invalidateQueries({ queryKey: queryKeys.post(vars.contentId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.thesis(vars.contentId) })
      queryClient.invalidateQueries({ queryKey: ["content"] })
    },
  })
}
