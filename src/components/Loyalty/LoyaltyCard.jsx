import React from "react";
import { Star, Gift, Crown, Award, TrendingUp } from "lucide-react";
import { useLoyalty } from "../../lib/loyalty-context";

const tierConfig = {
  Bronze: {
    icon: Star,
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    threshold: 0,
  },
  Silver: {
    icon: Award,
    gradient: "from-gray-400 to-gray-600",
    bgGradient: "from-gray-50 to-slate-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    threshold: 200,
  },
  Gold: {
    icon: Crown,
    gradient: "from-yellow-400 to-yellow-600",
    bgGradient: "from-yellow-50 to-amber-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    threshold: 500,
  },
  Platinum: {
    icon: TrendingUp,
    gradient: "from-purple-500 to-indigo-600",
    bgGradient: "from-purple-50 to-indigo-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    threshold: 1000,
  },
};

export default function LoyaltyCard({ compact = false }) {
  const {
    loyaltyData,
    getPointsNeededForDiscount,
    getDiscountProgress,
    getTierBenefits,
  } = useLoyalty();

  if (!loyaltyData) return null;

  const tierInfo = tierConfig[loyaltyData.tier];
  const TierIcon = tierInfo.icon;
  const pointsNeeded = getPointsNeededForDiscount();
  const progress = getDiscountProgress();
  const benefits = getTierBenefits(loyaltyData.tier);

  if (compact) {
    return (
      <div
        className={`p-4 rounded-xl bg-gradient-to-br ${tierInfo.bgGradient} border ${tierInfo.borderColor}`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${tierInfo.gradient} shadow-lg`}
          >
            <TierIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-bold ${tierInfo.textColor}`}>
                {loyaltyData.tier} Member
              </h3>
              {loyaltyData.canUseDiscount && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  50% OFF Ready!
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{loyaltyData.points} points</p>
          </div>
        </div>

        {!loyaltyData.canUseDiscount && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress to 50% discount</span>
              <span>{pointsNeeded} points needed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${tierInfo.gradient} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Loyalty Card */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tierInfo.bgGradient} border-2 ${tierInfo.borderColor} shadow-xl`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-current" />
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-current" />
        </div>

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div
                className={`p-4 rounded-2xl bg-gradient-to-br ${tierInfo.gradient} shadow-lg`}
              >
                <TierIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${tierInfo.textColor}`}>
                  {loyaltyData.tier} Member
                </h2>
                <p className="text-gray-600">LitwayPicks Loyalty Program</p>
              </div>
            </div>

            {loyaltyData.canUseDiscount && (
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <Gift className="h-5 w-5" />
                  <span className="font-bold">50% OFF Ready!</span>
                </div>
              </div>
            )}
          </div>

          {/* Points Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <PointStat
              label="Current Points"
              value={loyaltyData.points}
              color={tierInfo.textColor}
            />
            <PointStat
              label="Total Earned"
              value={loyaltyData.totalEarned}
              color={tierInfo.textColor}
            />
            <PointStat
              label="Total Redeemed"
              value={loyaltyData.totalRedeemed}
              color={tierInfo.textColor}
            />
          </div>

          {/* Progress Bar */}
          {!loyaltyData.canUseDiscount && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">
                  Progress to 50% Discount
                </span>
                <span className="text-sm text-gray-600">
                  {pointsNeeded} points needed
                </span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-3 shadow-inner">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${tierInfo.gradient} transition-all duration-1000 shadow-sm`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center mt-2">
                <span className="text-sm font-medium text-gray-600">
                  {progress.toFixed(1)}% Complete
                </span>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Your {loyaltyData.tier} Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${tierInfo.gradient}`}
                  />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {loyaltyData.tier !== "Platinum" && (
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3">
            Unlock {getNextTier(loyaltyData.tier)} Status
          </h3>
          <NextTierProgress
            tier={loyaltyData.tier}
            totalEarned={loyaltyData.totalEarned}
          />
        </div>
      )}
    </div>
  );
}

// Helper component for stat display
function PointStat({ label, value, color }) {
  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// Helper to calculate and render next tier progress bar
function NextTierProgress({ tier, totalEarned }) {
  let nextThreshold, gradient;

  switch (tier) {
    case "Bronze":
      nextThreshold = 200;
      gradient = "from-blue-400 to-blue-600";
      break;
    case "Silver":
      nextThreshold = 500;
      gradient = "from-yellow-400 to-yellow-600";
      break;
    case "Gold":
      nextThreshold = 1000;
      gradient = "from-purple-500 to-indigo-600";
      break;
    default:
      return null;
  }

  const progress = ((totalEarned - (nextThreshold - 200)) / 200) * 100;
  const pointsRemaining = nextThreshold - totalEarned;

  return (
    <>
      <p className="text-sm text-blue-700">
        Earn {pointsRemaining} more points to reach {getNextTier(tier)} tier
      </p>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </>
  );
}

// Get next tier based on current
function getNextTier(tier) {
  const order = ["Bronze", "Silver", "Gold", "Platinum"];
  const index = order.indexOf(tier);
  return order[index + 1] || "Platinum";
}
