"use client"

import { Mail01Icon } from "@hugeicons/core-free-icons"

import { useDigestsQuery } from "@/queries/digests"
import type { DigestListParams } from "@/services/digests"
import type { DigestListResponse } from "@/shared/types"
import { DigestCard } from "@/components/dashboard/DigestCard"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function DigestList({
  params,
  initial,
}: {
  params: DigestListParams
  initial: DigestListResponse
}) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDigestsQuery(params, initial)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center font-sans text-sm text-foreground/60">
        {error instanceof Error ? error.message : "Couldn't load briefs."}
      </p>
    )
  }

  const items = data?.pages.flatMap((p) => p.items) ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Mail01Icon}
        title="No briefs yet"
        description="Once your newsletters arrive and are summarized they'll show up here. Hit “Sync now” to fetch the latest."
      />
    )
  }

  return (
    <div className="animate-slide-up flex flex-col gap-3">
      {items.map((d) => (
        <DigestCard key={d.id} digest={d} />
      ))}
      {hasNextPage ? (
        <Button
          variant="outline"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mx-auto mt-2"
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  )
}
