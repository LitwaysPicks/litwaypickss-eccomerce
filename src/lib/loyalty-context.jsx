import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import { formatCurrency } from "./currency";

const LoyaltyContext = createContext();

// Loyalty system configuration
const LOYALTY_CONFIG = {
  POINTS_PER_DOLLAR: 1, // 1 point per LRD spent
  POINTS_FOR_DISCOUNT: 100, // 100 points needed for discount
  DISCOUNT_PERCENTAGE: 50, // 50% discount when using points
  BONUS_POINTS: {
    FIRST_PURCHASE: 20,
    BIRTHDAY: 50,
    REFERRAL: 25,
    REVIEW: 5,
  },
};

export function LoyaltyProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    tier: "Bronze",
    history: [],
    canUseDiscount: false,
  });

  // Load loyalty data from localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedData = localStorage.getItem(`loyalty-${user.id}`);
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setLoyaltyData(data);
        } catch (error) {
          console.error("Error loading loyalty data:", error);
        }
      }
    }
  }, [isAuthenticated, user]);

  // Save loyalty data to localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`loyalty-${user.id}`, JSON.stringify(loyaltyData));
    }
  }, [loyaltyData, isAuthenticated, user]);

  // Helper to calculate tier
  const calculateTier = (totalEarned) => {
    if (totalEarned >= 1000) return "Platinum";
    if (totalEarned >= 500) return "Gold";
    if (totalEarned >= 200) return "Silver";
    return "Bronze";
  };

  // Add points after purchase
  const addPointsForPurchase = (orderTotal, isFirstPurchase = false) => {
    if (!isAuthenticated) return;

    const basePoints = Math.floor(
      orderTotal * LOYALTY_CONFIG.POINTS_PER_DOLLAR
    );
    const bonusPoints = isFirstPurchase
      ? LOYALTY_CONFIG.BONUS_POINTS.FIRST_PURCHASE
      : 0;
    const totalPoints = basePoints + bonusPoints;

    const transaction = {
      id: Date.now().toString(),
      type: "earned",
      points: totalPoints,
      description: isFirstPurchase
        ? `Purchase + First Purchase Bonus (${formatCurrency(orderTotal)})`
        : `Purchase (${formatCurrency(orderTotal)})`,
      date: new Date().toISOString(),
      orderTotal,
    };

    setLoyaltyData((prev) => {
      const newTotalEarned = prev.totalEarned + totalPoints;
      const newPoints = prev.points + totalPoints;
      const newTier = calculateTier(newTotalEarned);
      const canUseDiscount = newPoints >= LOYALTY_CONFIG.POINTS_FOR_DISCOUNT;

      return {
        ...prev,
        points: newPoints,
        totalEarned: newTotalEarned,
        tier: newTier,
        canUseDiscount,
        history: [transaction, ...prev.history],
      };
    });

    toast.success(`🎉 You earned ${totalPoints} loyalty points!`, {
      description: isFirstPurchase
        ? "Including first purchase bonus!"
        : undefined,
    });

    return totalPoints;
  };

  // Redeem points for a discount
  const redeemPointsForDiscount = (orderTotal) => {
    if (
      !isAuthenticated ||
      loyaltyData.points < LOYALTY_CONFIG.POINTS_FOR_DISCOUNT
    ) {
      return { success: false, discount: 0 };
    }

    const discountAmount =
      orderTotal * (LOYALTY_CONFIG.DISCOUNT_PERCENTAGE / 100);
    const pointsUsed = LOYALTY_CONFIG.POINTS_FOR_DISCOUNT;

    const transaction = {
      id: Date.now().toString(),
      type: "redeemed",
      points: pointsUsed,
      description: `${LOYALTY_CONFIG.DISCOUNT_PERCENTAGE}% Discount Applied`,
      date: new Date().toISOString(),
      discountAmount,
    };

    setLoyaltyData((prev) => {
      const newPoints = prev.points - pointsUsed;
      const newTotalRedeemed = prev.totalRedeemed + pointsUsed;
      const canUseDiscount = newPoints >= LOYALTY_CONFIG.POINTS_FOR_DISCOUNT;

      return {
        ...prev,
        points: newPoints,
        totalRedeemed: newTotalRedeemed,
        canUseDiscount,
        history: [transaction, ...prev.history],
      };
    });

    toast.success(
      `🎊 ${LOYALTY_CONFIG.DISCOUNT_PERCENTAGE}% discount applied!`,
      {
        description: `You saved ${formatCurrency(discountAmount)}`,
      }
    );

    return { success: true, discount: discountAmount, pointsUsed };
  };

  // Add bonus points manually
  const addBonusPoints = (type, description) => {
    if (!isAuthenticated || !LOYALTY_CONFIG.BONUS_POINTS[type]) return;

    const points = LOYALTY_CONFIG.BONUS_POINTS[type];

    const transaction = {
      id: Date.now().toString(),
      type: "bonus",
      points,
      description,
      date: new Date().toISOString(),
    };

    setLoyaltyData((prev) => {
      const newTotalEarned = prev.totalEarned + points;
      const newPoints = prev.points + points;
      const newTier = calculateTier(newTotalEarned);
      const canUseDiscount = newPoints >= LOYALTY_CONFIG.POINTS_FOR_DISCOUNT;

      return {
        ...prev,
        points: newPoints,
        totalEarned: newTotalEarned,
        tier: newTier,
        canUseDiscount,
        history: [transaction, ...prev.history],
      };
    });

    toast.success(`🌟 Bonus! You earned ${points} points!`, { description });
  };

  const getPointsNeededForDiscount = () =>
    Math.max(0, LOYALTY_CONFIG.POINTS_FOR_DISCOUNT - loyaltyData.points);

  const getDiscountProgress = () =>
    Math.min(
      100,
      (loyaltyData.points / LOYALTY_CONFIG.POINTS_FOR_DISCOUNT) * 100
    );

  const getTierBenefits = (tier) => {
    const benefits = {
      Bronze: ["1 point per LRD spent", "Birthday bonus points"],
      Silver: [
        "1 point per LRD spent",
        "Birthday bonus points",
        "Early access to sales",
      ],
      Gold: [
        "1.2 points per LRD spent",
        "Birthday bonus points",
        "Early access to sales",
        "Free express shipping",
      ],
      Platinum: [
        "1.5 points per LRD spent",
        "Birthday bonus points",
        "Early access to sales",
        "Free express shipping",
        "Personal shopping assistant",
      ],
    };
    return benefits[tier] || benefits.Bronze;
  };

  return (
    <LoyaltyContext.Provider
      value={{
        loyaltyData,
        addPointsForPurchase,
        redeemPointsForDiscount,
        addBonusPoints,
        getPointsNeededForDiscount,
        getDiscountProgress,
        getTierBenefits,
        config: LOYALTY_CONFIG,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error("useLoyalty must be used within a LoyaltyProvider");
  }
  return context;
}

