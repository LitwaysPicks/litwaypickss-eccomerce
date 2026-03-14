import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Sparkles,
  Zap,
  Gift,
  Star,
} from "lucide-react";

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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrent((prev) => (prev + 1) % heroSlides.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setProgress(0);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
    setProgress(0);
  };

  const goToSlide = (index) => {
    setCurrent(index);
    setProgress(0);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const currentSlide = heroSlides[current];

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[580px] md:h-[550px] lg:h-[650px]">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === current
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
                  index === current ? "scale-110" : "scale-100"
                }`}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
              />

              <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-10">
                <div className="max-w-4xl w-full text-center space-y-6">
                  {/* Badge moved up and centered */}
                  <div
                    className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4 mx-auto transition-all duration-700 ${
                      index === current
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "200ms" }}
                  >
                    <slide.badgeIcon className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {slide.badge}
                    </span>
                  </div>

                  {/* Title, Subtitle, Description */}
                  <h1
                    className={`text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight transition-all duration-700 ${
                      index === current
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "400ms" }}
                  >
                    {slide.title}
                  </h1>

                  <h2
                    className={`text-lg sm:text-2xl text-orange-200 transition-all duration-700 ${
                      index === current
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "600ms" }}
                  >
                    {slide.subtitle}
                  </h2>

                  <p
                    className={`text-base sm:text-lg text-gray-200 max-w-2xl mx-auto transition-all duration-700 ${
                      index === current
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "800ms" }}
                  >
                    {slide.description}
                  </p>

                  {/* Stats Grid */}
                  <div
                    className={`flex justify-center flex-wrap gap-6 transition-all duration-700 ${
                      index === current
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "1000ms" }}
                  >
                    {slide.stats.map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-300">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div
                    className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ${
                      index === current
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "1200ms" }}
                  >
                    <Link
                      to={slide.link}
                      className="group inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <span>{slide.cta}</span>
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to={slide.linkSecondary}
                      className="group inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full transition-all duration-300 hover:bg-white/20"
                    >
                      <span>{slide.ctaSecondary}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation arrows moved up on mobile */}
        <button
          onClick={goToPrevious}
          className="absolute top-4 md:top-1/2 left-4 md:left-8 -translate-y-0 md:-translate-y-1/2 group z-30"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
        </button>

        <button
          onClick={goToNext}
          className="absolute top-4 md:top-1/2 right-4 md:right-8 -translate-y-0 md:-translate-y-1/2 group z-30"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-30">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group relative"
            >
              <div
                className={`w-12 h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? "bg-white"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              >
                {index === current && (
                  <div
                    className="h-full bg-primary-400 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Auto-play toggle */}
        <button
          onClick={toggleAutoPlay}
          className="absolute bottom-8 right-8 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 z-30"
        >
          <Play
            className={`h-4 w-4 text-white transition-transform ${
              isAutoPlaying ? "scale-0" : "scale-100"
            }`}
          />
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform ${
              isAutoPlaying ? "scale-100" : "scale-0"
            }`}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full ml-1" />
          </div>
        </button>
      </div>
    </section>
  );
}
