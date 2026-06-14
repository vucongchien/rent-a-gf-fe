import React from 'react'

export default function CompanionDetailLoading() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-10 space-y-16 pb-32 animate-pulse">
      {/* Cover Block Skeleton */}
      <div className="h-64 sm:h-80 md:h-[400px] bg-neutral-100 rounded-3xl w-full" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,0.85fr)_1.15fr] gap-8 md:gap-12 items-start">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-neutral-100 rounded-2xl w-full" />
          <div className="grid grid-cols-3 gap-2.5">
            <div className="aspect-square bg-neutral-100 rounded-xl" />
            <div className="aspect-square bg-neutral-100 rounded-xl" />
            <div className="aspect-square bg-neutral-100 rounded-xl" />
          </div>
        </div>
        
        {/* Profile Note Skeleton */}
        <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="h-8 bg-neutral-100 rounded-md w-1/3" />
          <div className="h-4 bg-neutral-100 rounded-md w-1/2" />
          <div className="space-y-2">
            <div className="h-4 bg-neutral-100 rounded-md w-full" />
            <div className="h-4 bg-neutral-100 rounded-md w-5/6" />
            <div className="h-4 bg-neutral-100 rounded-md w-4/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-neutral-100 rounded-full w-16" />
            <div className="h-6 bg-neutral-100 rounded-full w-20" />
            <div className="h-6 bg-neutral-100 rounded-full w-24" />
          </div>
          <div className="h-10 bg-neutral-100 rounded-full w-1/3" />
        </div>
      </div>
      
      {/* Scenes Skeleton */}
      <div className="space-y-6">
        <div className="h-8 bg-neutral-100 rounded-md w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="h-[220px] bg-neutral-100 rounded-2xl" />
          <div className="h-[220px] bg-neutral-100 rounded-2xl" />
          <div className="h-[220px] bg-neutral-100 rounded-2xl" />
        </div>
      </div>

      {/* Reviews Skeleton */}
      <div className="space-y-6">
        <div className="h-8 bg-neutral-100 rounded-md w-1/4" />
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          <div className="h-32 bg-neutral-100 rounded-2xl mb-6" />
          <div className="h-40 bg-neutral-100 rounded-2xl mb-6" />
          <div className="h-28 bg-neutral-100 rounded-2xl mb-6" />
        </div>
      </div>
    </div>
  )
}
