"use client";

import React from "react";
import { Star } from "lucide-react";

function StarRow({ rating, size = "h-4 w-4" }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right text-gray-600">{label}</span>
      <Star className="h-3 w-3 text-yellow-400 fill-current shrink-0" />
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-gray-500">{count}</span>
    </div>
  );
}

export default function ProductReviews({ reviews = [], averageRating = 0, reviewCount = 0 }) {
  if (reviews.length === 0) {
    return (
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        <div className="card p-8 text-center">
          <Star className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          <p className="text-sm text-gray-400 mt-1">
            Purchase and complete your order to leave a review.
          </p>
        </div>
      </section>
    );
  }

  // Build distribution counts
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Summary */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl">
          <span className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
          <StarRow rating={averageRating} size="h-5 w-5" />
          <span className="text-sm text-gray-500 mt-1">
            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Distribution */}
        <div className="md:col-span-2 flex flex-col justify-center gap-2 p-6">
          {dist.map(({ star, count }) => (
            <RatingBar key={star} label={star} count={count} total={reviewCount} />
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{review.displayName}</p>
                <StarRow rating={review.rating} />
              </div>
              <time className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString("en", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            {review.comment && (
              <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
