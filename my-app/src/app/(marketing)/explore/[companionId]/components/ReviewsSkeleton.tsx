import React from 'react'

export function ReviewsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-neutral-100 rounded-md w-1/4" />
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        <div className="h-32 bg-neutral-100 rounded-2xl mb-6" />
        <div className="h-40 bg-neutral-100 rounded-2xl mb-6" />
        <div className="h-28 bg-neutral-100 rounded-2xl mb-6" />
      </div>
    </div>
  )
}
