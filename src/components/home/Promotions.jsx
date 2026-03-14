import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Clock, Star, TrendingUp, Award, Zap } from "lucide-react";
import { formatCurrency } from "../../lib/currency";

export default function Promotions() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const promoSections = [
    {
      title: "Today's Deal",
      icon: Clock,
      badge: "Limited Time",
      badgeColor: "bg-gradient-to-r from-red-500 to-red-600",
      cardColor: "bg-gradient-to-br from-red-50 to-pink-50 border-red-200",
      products: [
        {
          name: "Wireless Bluetooth Headphones",
          originalPrice: 150,
          salePrice: 89,
          image:
            "https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.8,
          reviews: 234,
        },
      ],
      hasTimer: true,
    },
    {
      title: "Best Sellers",
      icon: Award,
      badge: "Top Rated",
      badgeColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
      cardColor:
        "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200",
      products: [
        {
          name: "Premium Cotton T-Shirt",
          originalPrice: 45,
          salePrice: 35,
          image:
            "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.9,
          reviews: 456,
        },
        {
          name: "Smart Fitness Watch",
          originalPrice: 299,
          salePrice: 199,
          image:
            "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.7,
          reviews: 189,
        },
      ],
    },
    {
      title: "Trending Now",
      icon: TrendingUp,
      badge: "Hot",
      badgeColor: "bg-gradient-to-r from-orange-500 to-red-500",
      cardColor: "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200",
      products: [
        {
          name: "Eco-Friendly Water Bottle",
          originalPrice: 25,
          salePrice: 18,
          image:
            "https://images.pexels.com/photos/3735709/pexels-photo-3735709.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.6,
          reviews: 123,
        },
        {
          name: "Minimalist Backpack",
          originalPrice: 89,
          salePrice: 65,
          image:
            "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.8,
          reviews: 298,
        },
      ],
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-orange-100 rounded-full px-6 py-2 mb-4">
          <Zap className="h-4 w-4 text-primary-600" />
          <span className="text-primary-600 font-semibold text-sm">
            SPECIAL OFFERS
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Special Offers & Promotions
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Don't miss out on these amazing deals and trending products
        </p>
      </div>

      <div className="space-y-12">
        {promoSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg">
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h3>
                  <span
                    className={`${section.badgeColor} text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg`}
                  >
                    {section.badge}
                  </span>
                </div>
              </div>

              {section.hasTimer && (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl shadow-lg">
                  <Clock className="h-5 w-5" />
                  <div className="flex space-x-1 font-bold text-lg">
                    <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span>:</span>
                    <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span>:</span>
                    <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.products.map((product, productIndex) => (
                <div
                  key={productIndex}
                  className={`group cursor-pointer overflow-hidden card-elevated ${section.cardColor} hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
                >
                  <div className="relative">
                    <div className="aspect-[4/3] relative overflow-hidden rounded-t-xl">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {Math.round(
                        ((product.originalPrice - product.salePrice) /
                          product.originalPrice) *
                          100,
                      )}
                      % OFF
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-2">
                      {product.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        ({product.reviews})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(product.salePrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    </div>
                    <button className="w-full btn btn-primary py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}

              {/* View All Card */}
              <div
                className={`group cursor-pointer border-2 border-dashed border-primary-300 hover:border-primary-500 transition-all duration-500 card-elevated bg-gradient-to-br from-white to-primary-25 hover:shadow-2xl transform hover:-translate-y-2`}
              >
                <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <section.icon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl mb-3">
                      View All {section.title}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Discover more amazing deals
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    className="btn btn-primary px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Browse More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
