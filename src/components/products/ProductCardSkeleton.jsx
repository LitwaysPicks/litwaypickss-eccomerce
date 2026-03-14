import React from 'react'

export default function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-square w-full bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-full bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-6 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  )
}