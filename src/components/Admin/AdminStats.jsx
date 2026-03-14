import React from 'react'
import { Package, DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Star } from 'lucide-react'
import { formatCurrency } from '../../lib/currency'

export default function AdminStats({ products }) {
  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
  const lowStockProducts = products.filter(p => p.stock <= 10).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length
  const featuredProducts = products.filter(p => p.featured).length
  const averagePrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Low Stock Alert',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Out of Stock',
      value: outOfStockProducts,
      icon: ShoppingCart,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Featured Products',
      value: featuredProducts,
      icon: Star,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Average Price',
      value: formatCurrency(averagePrice),
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className={`card p-6 ${stat.bgColor} border-0 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}