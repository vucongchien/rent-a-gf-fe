import React from 'react'

export function ScenesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-neutral-100 rounded-md w-1/4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="h-[220px] bg-neutral-100 rounded-2xl" />
        <div className="h-[220px] bg-neutral-100 rounded-2xl" />
        <div className="h-[220px] bg-neutral-100 rounded-2xl" />
      </div>
    </div>
  )
}
