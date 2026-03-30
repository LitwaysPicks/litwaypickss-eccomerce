"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const SLIDE_DURATION = 5000;

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
    badge: "New Arrivals",
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
    badge: "Up to 40% Off",
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
    badge: "Trending Now",
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
    badge: "Free Delivery",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  // Only render images for the active slide + the next slide so we never
  // download all 4 hero images on page load (1920×1080 each).
  const nextIndex = (current + 1) % heroSlides.length;

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
      <div className="relative h-[60vh] md:h-[65vh] lg:h-[75vh]">
        {heroSlides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <div className="relative h-full">
                {(index === current || index === nextIndex) && (
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/55" />

                <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-10">
                  <div className="max-w-3xl w-full text-center space-y-5">
                    <span
                      className={`inline-block border border-white/40 text-white text-xs font-medium tracking-widest uppercase px-4 py-1.5 transition-all duration-700 ${
                        isActive
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-3"
                      }`}
                      style={{ transitionDelay: "200ms" }}
                    >
                      {slide.badge}
                    </span>

                    <h1
                      className={`text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight transition-all duration-700 ${
                        isActive
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6"
                      }`}
                      style={{ transitionDelay: "350ms" }}
                    >
                      {slide.title}
                    </h1>

                    <p
                      className={`text-base sm:text-lg text-white/75 max-w-xl mx-auto transition-all duration-700 ${
                        isActive
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6"
                      }`}
                      style={{ transitionDelay: "500ms" }}
                    >
                      {slide.description}
                    </p>

                    <div
                      className={`flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700 ${
                        isActive
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6"
                      }`}
                      style={{ transitionDelay: "650ms" }}
                    >
                      <Link
                        href={slide.link}
                        className="inline-flex items-center justify-center px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-md transition-colors duration-200"
                      >
                        {slide.cta}
                      </Link>
                      <Link
                        href={slide.linkSecondary}
                        className="inline-flex items-center justify-center px-7 py-3 border border-white/50 text-white font-medium rounded-md hover:bg-white/10 transition-colors duration-200"
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
          className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 z-30 w-10 h-10 border border-white/30 hover:bg-white/15 rounded-md md:flex items-center justify-center transition-colors duration-200 hidden"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={advance}
          aria-label="Next slide"
          className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 z-30 w-10 h-10 border border-white/30 hover:bg-white/15 rounded-md hidden md:flex items-center justify-center transition-colors duration-200"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="relative w-10 h-1 rounded-full overflow-hidden bg-white/30"
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
            </button>
          ))}
        </div>

        {/* Play / Pause */}
        <button
          onClick={() => setIsAutoPlaying((p) => !p)}
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          className="absolute bottom-6 right-6 w-8 h-8 border border-white/30 hover:bg-white/15 rounded-md flex items-center justify-center transition-colors duration-200 z-30"
        >
          {isAutoPlaying ? (
            <Pause className="h-3.5 w-3.5 text-white" />
          ) : (
            <Play className="h-3.5 w-3.5 text-white" />
          )}
        </button>
      </div>
    </section>
  );
}
