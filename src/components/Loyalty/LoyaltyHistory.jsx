import React, { useState } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Gift,
  Star,
  Filter,
} from "lucide-react";
import { useLoyalty } from "../../lib/loyalty-context";
import { formatCurrency } from "../../lib/currency";

export default function LoyaltyHistory() {
  const { loyaltyData } = useLoyalty();
  const [filter, setFilter] = useState("all");

  if (!loyaltyData) return null;

  const filteredHistory = loyaltyData.history.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case "earned":
        return TrendingUp;
      case "redeemed":
        return TrendingDown;
      case "bonus":
        return Gift;
      default:
        return Star;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "earned":
        return "text-green-600 bg-green-50 border-green-200";
      case "redeemed":
        return "text-red-600 bg-red-50 border-red-200";
      case "bonus":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = [
    {
      label: "Total Earned",
      value: loyaltyData.totalEarned,
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Redeemed",
      value: loyaltyData.totalRedeemed,
      icon: TrendingDown,
      color: "text-red-600 bg-red-50",
    },
    {
      label: "Total Transactions",
      value: loyaltyData.history.length,
      icon: Calendar,
      color: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`card p-6 ${stat.color} border-0 rounded-xl shadow-sm`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-white/50 shadow-sm">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-75">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Transaction History
          </h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input w-auto text-sm"
            >
              <option value="all">All Transactions</option>
              <option value="earned">Points Earned</option>
              <option value="redeemed">Points Redeemed</option>
              <option value="bonus">Bonus Points</option>
            </select>
          </div>
        </div>

        {/* Transaction List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);
              const colorClass = getTransactionColor(transaction.type);

              return (
                <div
                  key={transaction.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-3 rounded-full border ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">
                        {transaction.description}
                      </h4>
                      <div className="text-right">
                        <span
                          className={`font-bold ${
                            transaction.type === "redeemed"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.type === "redeemed" ? "-" : "+"}
                          {transaction.points} points
                        </span>
                        {transaction.discountAmount && (
                          <div className="text-sm text-gray-600">
                            Saved {formatCurrency(transaction.discountAmount)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="capitalize">
                        {transaction.type} Transaction
                      </span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>

                    {transaction.orderTotal && (
                      <div className="text-sm text-gray-500 mt-1">
                        Order Total: {formatCurrency(transaction.orderTotal)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "all"
                ? "No transactions yet"
                : `No ${filter} transactions`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === "all"
                ? "Start shopping to earn your first loyalty points!"
                : `You haven't ${
                    filter === "earned"
                      ? "earned"
                      : filter === "redeemed"
                      ? "redeemed"
                      : "received bonus"
                  } points yet.`}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="btn btn-outline"
              >
                View All Transactions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Points Earning Guide */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          How to Earn More Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div>
              <div className="font-medium text-blue-800">Make Purchases</div>
              <div className="text-sm text-blue-600">
                Earn 1 point per LRD spent
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Gift className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-blue-800">Write Reviews</div>
              <div className="text-sm text-blue-600">
                Get 5 bonus points per review
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-blue-800">Birthday Bonus</div>
              <div className="text-sm text-blue-600">
                Receive 50 points annually
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-blue-800">Refer Friends</div>
              <div className="text-sm text-blue-600">
                Earn 25 points per referral
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
