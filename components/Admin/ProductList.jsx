"use client";

import React from "react";
import { formatCurrency } from "@/lib/currency";

function StockBadge({ stock }) {
  if (stock === 0)
    return <span className="text-xs font-medium text-rose-600">Out of stock</span>;
  if (stock <= 10)
    return <span className="text-xs font-medium text-amber-600">{stock} left</span>;
  return <span className="text-xs text-gray-500">{stock}</span>;
}

export default function ProductList({
  products,
  onEdit,
  onDelete,
  deletingId,
  onConfirmDelete,
  onCancelDelete,
}) {
  if (products.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="text-sm font-medium text-gray-500">No products found</p>
        <p className="mt-1 text-xs text-gray-400">Try adjusting your filters or add a new product.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-gray-100">
        {products.map((product) => {
          const isPendingDelete = deletingId === product.id;

          if (isPendingDelete) {
            return (
              <div key={product.id} className="bg-rose-50/60 px-4 py-4">
                <p className="text-sm text-gray-700 mb-3">
                  Remove <span className="font-semibold text-gray-900">{product.name}</span>?{" "}
                  <span className="text-gray-500">This cannot be undone.</span>
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onCancelDelete}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirmDelete}
                    className="text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg px-3.5 py-1.5 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={product.id} className="flex items-center gap-3 px-4 py-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">—</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate text-sm">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 tabular-nums">{formatCurrency(product.price)}</span>
                  <span className="text-gray-300">·</span>
                  <StockBadge stock={product.stock} />
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onEdit(product)}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2.5 py-1.5 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="text-xs font-medium text-rose-500 hover:text-rose-700 border border-rose-200 rounded-md px-2.5 py-1.5 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">Product</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">Category</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 hidden lg:table-cell">Variants</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400">Price</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400">Stock</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => {
              const isPendingDelete = deletingId === product.id;

              if (isPendingDelete) {
                return (
                  <tr key={product.id} className="bg-rose-50/60">
                    <td colSpan={6} className="px-5 py-3.5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-700">
                          Remove{" "}
                          <span className="font-semibold text-gray-900">{product.name}</span>?{" "}
                          <span className="text-gray-500">This cannot be undone.</span>
                        </p>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={onCancelDelete}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={onConfirmDelete}
                            className="text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg px-3.5 py-1.5 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Product */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">—</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-50">{product.name}</p>
                        {product.brand && (
                          <p className="text-xs text-gray-400 truncate">{product.brand}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5">
                    <span className="text-gray-600">{product.category_name ?? "—"}</span>
                  </td>

                  {/* Variants: sizes + colors */}
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-col gap-1">
                      {product.sizes?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map((s) => (
                            <span key={s} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {product.colors?.length > 0 && (
                        <div className="flex gap-1">
                          {product.colors.slice(0, 6).map((color, i) => (
                            <span
                              key={i}
                              title={color}
                              className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: color.toLowerCase() }}
                            />
                          ))}
                          {product.colors.length > 6 && (
                            <span className="text-[11px] text-gray-400">+{product.colors.length - 6}</span>
                          )}
                        </div>
                      )}
                      {!product.sizes?.length && !product.colors?.length && (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3.5 text-right">
                    <p className="font-medium text-gray-900 tabular-nums">{formatCurrency(product.price)}</p>
                    {product.sale_price && (
                      <p className="text-xs text-gray-400 line-through tabular-nums">{formatCurrency(product.sale_price)}</p>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-5 py-3.5 text-right">
                    <StockBadge stock={product.stock} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => onEdit(product)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-sm font-medium text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
