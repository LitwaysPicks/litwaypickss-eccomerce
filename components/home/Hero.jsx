"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  Zap,
  Gift,
  Star,
} from "lucide-react";

const SLIDE_DURATION = 5000; // ms

const heroSlides = [
  {
    id: 1,
    title: "Discover Amazing Products",
    subtitle: "Premium Quality, Unbeatable Prices",
    description:
      "Shop the latest trends with free nationwide delivery across all 15 counties in Liberia",
    cta: "Shop Now",
    ctaSecondary: "Explore Categories",
    link: "/shop",
    linkSecondary: "/shop",
    image:
      "https://images.pexels.com/photos/6214479/pexels-photo-6214479.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    gradient: "from-purple-900/80 via-blue-900/70 to-indigo-900/80",
    badge: "New Arrivals",
    badgeIcon: Sparkles,
    stats: [
      { label: "Products", value: "5000+" },
      { label: "Happy Customers", value: "10K+" },
      { label: "Counties Served", value: "15" },
    ],
  },
  {
    id: 2,
    title: "Tech Revolution Starts Here",
    subtitle: "Latest Electronics & Gadgets",
    description:
      "From smartphones to smart watches, discover cutting-edge technology with warranty and support",
    cta: "Browse Electronics",
    ctaSecondary: "View Deals",
    link: "/shop/electronics",
    linkSecondary: "/shop/electronics",
    image:
      "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    gradient: "from-orange-900/80 via-red-900/70 to-pink-900/80",
    badge: "Up to 40% Off",
    badgeIcon: Zap,
    stats: [
      { label: "Tech Products", value: "500+" },
      { label: "Brands", value: "50+" },
      { label: "Warranty", value: "2 Years" },
    ],
  },
  {
    id: 3,
    title: "Fashion Forward",
    subtitle: "Style That Speaks Volumes",
    description:
      "Express your unique personality with our curated collection of trendy clothing and accessories",
    cta: "Shop Fashion",
    ctaSecondary: "New Collection",
    link: "/shop/womens",
    linkSecondary: "/shop/mens",
    image:
      "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    gradient: "from-emerald-900/80 via-teal-900/70 to-cyan-900/80",
    badge: "Trending Now",
    badgeIcon: Star,
    stats: [
      { label: "Fashion Items", value: "2000+" },
      { label: "New Weekly", value: "100+" },
      { label: "Styles", value: "Unlimited" },
    ],
  },
  {
    id: 4,
    title: "Home & Lifestyle",
    subtitle: "Transform Your Living Space",
    description:
      "Create the perfect home with our collection of furniture, decor, and lifestyle products",
    cta: "Shop Home",
    ctaSecondary: "Garden Collection",
    link: "/shop/home-garden",
    linkSecondary: "/shop/home-garden",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
    gradient: "from-amber-900/80 via-orange-900/70 to-red-900/80",
    badge: "Free Delivery",
    badgeIcon: Gift,
    stats: [
      { label: "Home Items", value: "1500+" },
      { label: "Room Types", value: "All" },
      { label: "Delivery", value: "Free" },
    ],
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // Incrementing key forces CSS progress animation to restart on each slide change
  const [progressKey, setProgressKey] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
    setProgressKey((k) => k + 1);
  }, []);

  const goTo = useCallback((index) => {
    setCurrent(index);
    setProgressKey((k) => k + 1);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setProgressKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(advance, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isAutoPlaying, advance]);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-145 md:h-137.5 lg:h-162.5">
        {heroSlides.map((slide, index) => {
          const isActive = index === current;
          const BadgeIcon = slide.badgeIcon;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <div className="relative h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  className="object-cover"
                />
                <div className={`absolute inset-0 bg-linear-to-r ${slide.gradient}`} />

                <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-10">
                  <div className="max-w-4xl w-full text-center space-y-6">
                    <div
                      className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4 mx-auto transition-all duration-700 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      }`}
                      style={{ transitionDelay: "200ms" }}
                    >
                      <BadgeIcon className="h-4 w-4 text-white" />
                      <span className="text-white text-sm font-medium">{slide.badge}</span>
                    </div>

                    <h1
                      className={`text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight transition-all duration-700 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                      }`}
                      style={{ transitionDelay: "400ms" }}
                    >
                      {slide.title}
                    </h1>

                    <h2
                      className={`text-lg sm:text-2xl text-orange-200 transition-all duration-700 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                      }`}
                      style={{ transitionDelay: "600ms" }}
                    >
                      {slide.subtitle}
                    </h2>

                    <p
                      className={`text-base sm:text-lg text-gray-200 max-w-2xl mx-auto transition-all duration-700 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                      }`}
                      style={{ transitionDelay: "800ms" }}
                    >
                      {slide.description}
                    </p>

                    <div
                      className={`flex justify-center flex-wrap gap-6 transition-all duration-700 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                      }`}
                      style={{ transitionDelay: "1000ms" }}
                    >
                      {slide.stats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                          <div className="text-xs sm:text-sm text-gray-300">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                      }`}
                      style={{ transitionDelay: "1200ms" }}
                    >
                      <Link
                        href={slide.link}
                        className="group inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        <span>{slide.cta}</span>
                        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link
                        href={slide.linkSecondary}
                        className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full transition-all duration-300 hover:bg-white/20"
                      >
                        {slide.ctaSecondary}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Prev / Next */}
        <button
          onClick={goToPrevious}
          aria-label="Previous slide"
          className="absolute top-4 md:top-1/2 left-4 md:left-8 md:-translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-white" />
        </button>
        <button
          onClick={advance}
          aria-label="Next slide"
          className="absolute top-4 md:top-1/2 right-4 md:right-8 md:-translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-white" />
        </button>

        {/* Dot indicators + CSS progress bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-30">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="relative w-12 h-2 rounded-full overflow-hidden bg-white/30 hover:bg-white/50 transition-colors duration-300"
            >
              {index === current && (
                <span
                  key={progressKey}
                  className="absolute inset-y-0 left-0 bg-white rounded-full"
                  style={{
                    animation: isAutoPlaying
                      ? `slideProgress ${SLIDE_DURATION}ms linear forwards`
                      : "none",
                    width: isAutoPlaying ? "0%" : "100%",
                  }}
                />
              )}
              {index !== current && (
                <span className="absolute inset-0 bg-transparent" />
              )}
            </button>
          ))}
        </div>

        {/* Play / Pause */}
        <button
          onClick={() => setIsAutoPlaying((p) => !p)}
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          className="absolute bottom-8 right-8 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 z-30"
        >
          {isAutoPlaying ? (
            <Pause className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

    </section>
  );
}
