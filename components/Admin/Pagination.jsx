import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  pageCount,
  totalCount,
  pageSize,
  isFetching,
  onPageChange,
}) {
  if (pageCount <= 1) return null;

  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-white rounded-b-lg">
      <p className="text-sm text-gray-600">
        Showing {start}–{end} of {totalCount} products
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0 || isFetching}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="text-sm text-gray-500 px-1">
          {page + 1} / {pageCount}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount - 1 || isFetching}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
