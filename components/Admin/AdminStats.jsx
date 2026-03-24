"use client";

import React from "react";
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Star,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useAdminStats } from "@/hooks/useAdminStats";

const EMPTY = {
  total_products: 0,
  inventory_value: 0,
  low_stock: 0,
  out_of_stock: 0,
  featured: 0,
  average_price: 0,
};

export default function AdminStats() {
  const { data, isLoading } = useAdminStats();
  const stats = data ?? EMPTY;

  const cards = [
    {
      title: "Total Products",
      value: isLoading ? "…" : stats.total_products,
      icon: Package,
      color: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Inventory Value",
      value: isLoading ? "…" : formatCurrency(stats.inventory_value),
      icon: DollarSign,
      color: "bg-green-500",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      title: "Low Stock Alert",
      value: isLoading ? "…" : stats.low_stock,
      icon: AlertTriangle,
      color: "bg-orange-500",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      title: "Out of Stock",
      value: isLoading ? "…" : stats.out_of_stock,
      icon: ShoppingCart,
      color: "bg-red-500",
      bg: "bg-red-50",
      text: "text-red-600",
    },
    {
      title: "Featured Products",
      value: isLoading ? "…" : stats.featured,
      icon: Star,
      color: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      title: "Average Price",
      value: isLoading ? "…" : formatCurrency(stats.average_price),
      icon: TrendingUp,
      color: "bg-indigo-500",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`card p-6 ${card.bg} border-0 hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-center">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
