import React, { useState } from "react";
import { Gift, ChevronDown, ChevronUp, Percent, Sparkles } from "lucide-react";
import { useLoyalty } from "../../lib/loyalty-context";
import { formatCurrency } from "../../lib/currency";

export default function LoyaltyDiscountBanner({
  orderTotal,
  onDiscountApplied,
  appliedDiscount = null,
}) {
  const { loyaltyData, redeemPointsForDiscount, config } = useLoyalty();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  if (!loyaltyData) return null;

  const canUseDiscount = loyaltyData.canUseDiscount && !appliedDiscount;
  const hasAppliedDiscount = !!appliedDiscount;

  const handleApplyDiscount = async () => {
    if (!canUseDiscount || !orderTotal) return;

    setIsApplying(true);

    // Simulate processing delay
    setTimeout(() => {
      const result = redeemPointsForDiscount(orderTotal);
      if (result.success && onDiscountApplied) {
        onDiscountApplied(result);
      }
      setIsApplying(false);
    }, 1000);
  };

  const handleRemoveDiscount = () => {
    if (onDiscountApplied) {
      onDiscountApplied(null);
    }
  };

  const discountAmount = hasAppliedDiscount
    ? appliedDiscount.discount
    : orderTotal * (config.DISCOUNT_PERCENTAGE / 100);

  const finalTotal =
    orderTotal - (hasAppliedDiscount ? appliedDiscount.discount : 0);

  // Don't show banner if user can't use discount and hasn't applied one
  if (!canUseDiscount && !hasAppliedDiscount) {
    return null;
  }

  return (
    <div
      className={`card border-0 overflow-hidden transition-all duration-500 ${
        hasAppliedDiscount
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
      }`}
    >
      {/* Main Banner */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-full ${
                hasAppliedDiscount
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : "bg-gradient-to-br from-purple-500 to-pink-600"
              } shadow-lg`}
            >
              {hasAppliedDiscount ? (
                <Sparkles className="h-6 w-6 text-white" />
              ) : (
                <Gift className="h-6 w-6 text-white" />
              )}
            </div>

            <div>
              <h3
                className={`text-lg font-bold ${
                  hasAppliedDiscount ? "text-green-800" : "text-purple-800"
                }`}
              >
                {hasAppliedDiscount ? (
                  <>🎉 50% Loyalty Discount Applied!</>
                ) : (
                  <>🎁 50% Loyalty Discount Available!</>
                )}
              </h3>
              <p
                className={`text-sm ${
                  hasAppliedDiscount ? "text-green-600" : "text-purple-600"
                }`}
              >
                {hasAppliedDiscount ? (
                  <>
                    You saved {formatCurrency(appliedDiscount.discount)} with
                    your loyalty points!
                  </>
                ) : (
                  <>
                    Use your {config.POINTS_FOR_DISCOUNT} loyalty points to get
                    50% off this order
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {hasAppliedDiscount ? (
              <button
                onClick={handleRemoveDiscount}
                className="btn btn-outline text-green-700 border-green-300 hover:bg-green-100"
              >
                Remove Discount
              </button>
            ) : (
              <button
                onClick={handleApplyDiscount}
                disabled={isApplying}
                className="btn btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50"
              >
                {isApplying ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Applying...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4" />
                    <span>Apply 50% Off</span>
                  </div>
                )}
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-full transition-colors ${
                hasAppliedDiscount
                  ? "hover:bg-green-100 text-green-600"
                  : "hover:bg-purple-100 text-purple-600"
              }`}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          className={`border-t px-6 py-4 ${
            hasAppliedDiscount
              ? "border-green-200 bg-green-25"
              : "border-purple-200 bg-purple-25"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  hasAppliedDiscount ? "text-green-700" : "text-purple-700"
                }`}
              >
                {hasAppliedDiscount
                  ? appliedDiscount.pointsUsed
                  : config.POINTS_FOR_DISCOUNT}
              </div>
              <div className="text-sm text-gray-600">
                {hasAppliedDiscount ? "Points Used" : "Points Required"}
              </div>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  hasAppliedDiscount ? "text-green-700" : "text-purple-700"
                }`}
              >
                {config.DISCOUNT_PERCENTAGE}%
              </div>
              <div className="text-sm text-gray-600">Discount Applied</div>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  hasAppliedDiscount ? "text-green-700" : "text-purple-700"
                }`}
              >
                {formatCurrency(discountAmount)}
              </div>
              <div className="text-sm text-gray-600">
                {hasAppliedDiscount ? "Amount Saved" : "Potential Savings"}
              </div>
            </div>
          </div>

          {/* Order Total Breakdown */}
          <div className="mt-4 p-4 bg-white/50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Original Total:</span>
                <span>{formatCurrency(orderTotal)}</span>
              </div>
              {hasAppliedDiscount && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Loyalty Discount (50%):</span>
                    <span>-{formatCurrency(appliedDiscount.discount)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Final Total:</span>
                      <span className="text-green-700">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Points Balance After */}
          {hasAppliedDiscount && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Remaining Points:{" "}
                <span className="font-medium">{loyaltyData.points}</span>
                {loyaltyData.points >= config.POINTS_FOR_DISCOUNT && (
                  <span className="text-green-600 ml-2">
                    (You can use another discount!)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
