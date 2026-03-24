"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { useProducts, PAGE_SIZE } from "@/hooks/useProducts";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import Pagination from "./Pagination";

export default function ProductsTab() {
  // ── Filter + pagination state ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(0);

  // Debounce the search input 300 ms; reset to page 0 whenever filters change
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setPage(0);
  }, [selectedCategory]);

  // ── Product form state ─────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ── Inline delete-confirmation state ──────────────────────────────────
  const [deletingId, setDeletingId] = useState(null);

  // ── Data + mutations ───────────────────────────────────────────────────
  const {
    products,
    totalCount,
    pageCount,
    categories,
    isLoading,
    isFetching,
    addProduct,
    updateProduct,
    deleteProduct,
    loadProductForEdit,
  } = useProducts({ search: debouncedSearch, category: selectedCategory, page });

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleEditProduct = async (product) => {
    const loaded = await loadProductForEdit(product);
    if (loaded) {
      setEditingProduct(loaded);
      setShowForm(true);
    }
  };

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ productData, productId: editingProduct.id });
      } else {
        await addProduct.mutateAsync(productData);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch {
      // Toast already fired in mutation's onError — just keep the form open
    }
  };

  const handleConfirmDelete = () => {
    deleteProduct.mutate(deletingId);
    setDeletingId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Products</h2>
          <p className="text-gray-600 flex items-center gap-2">
            {isLoading
              ? "Loading…"
              : `${totalCount} product${totalCount !== 1 ? "s" : ""}`}
            {isFetching && !isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
            )}
          </p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product list */}
      {isLoading ? (
        <div className="card p-6">
          <p className="text-gray-500">Loading products…</p>
        </div>
      ) : (
        // Dim + block pointer events while a background fetch is in progress
        <div className={`transition-opacity ${isFetching ? "opacity-60 pointer-events-none" : ""}`}>
          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={setDeletingId}
            deletingId={deletingId}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={() => setDeletingId(null)}
          />
          <Pagination
            page={page}
            pageCount={pageCount}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Product form modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
