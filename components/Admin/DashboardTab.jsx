"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency";
import { supabase } from "@/lib/supabase";
import AdminStats from "./AdminStats";

// Targeted queries — only the columns and rows each panel actually needs.
// Neither query touches the full product table unboundedly; both are limited to 5 rows.

function useRecentProducts() {
  return useQuery({
    queryKey: ["admin-recent-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,price")
        .order("id", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

function useLowStock() {
  return useQuery({
    queryKey: ["admin-low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_with_categories")
        .select("id,name,stock,category_name")
        .lte("stock", 10)
        .order("stock", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

function RecentProducts() {
  const { data: products = [], isLoading } = useRecentProducts();

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Products</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">No products yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LowStockAlert() {
  const { data: products = [], isLoading } = useLowStock();

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">All products are well stocked.</p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.category_name}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.stock === 0
                    ? "bg-red-100 text-red-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {product.stock} left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardTab() {
  return (
    <div className="space-y-6">
      <AdminStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProducts />
        <LowStockAlert />
      </div>
    </div>
  );
}
