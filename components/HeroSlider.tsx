// components/HeroSlider.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const slides = [
  {
    id: 1,
    title: "Exclusive Wall Posters & Decor",
    subtitle: "Transform your space with high-gloss aesthetic prints.",
    bg: "from-blue-600 to-indigo-800",
    cta: "Shop Posters",
    link: "/category/wall-posters",
  },
  {
    id: 2,
    title: "B2B Wholesale Hub",
    subtitle: "Register your business account for bulk pricing & special discounts.",
    bg: "from-amber-600 to-orange-700",
    cta: "B2B Login",
    link: "/login",
  },
  {
    id: 3,
    title: "Digital Services & Jan Aadhaar",
    subtitle: "Fast and reliable citizen documentation and kiosk solutions.",
    bg: "from-emerald-600 to-teal-800",
    cta: "View Services",
    link: "/category/services",
  },
  {
    id: 4,
    title: "New Festive & Gift Collections",
    subtitle: "Explore handpicked gift sets designed for every occasion.",
    bg: "from-purple-600 to-pink-700",
    cta: "Explore Gifts",
    link: "/category/gifts",
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-xl my-4">
      <div 
        className="flex transition-transform duration-700 ease-in-out" 
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className={`w-full flex-shrink-0 bg-gradient-to-r ${slide.bg} text-white py-16 px-8 md:py-24 md:px-16 flex flex-col items-start justify-center min-h-[320px] md:min-h-[400px]`}
          >
            <span className="bg-white/20 text-xs md:text-sm uppercase tracking-widest px-3 py-1 rounded-full mb-4 backdrop-blur-md">
              Shree Shyam Digital & E-Commerce
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 max-w-2xl leading-tight">
              {slide.title}
            </h1>
            <p className="text-base md:text-xl text-gray-100 mb-8 max-w-xl">
              {slide.subtitle}
            </p>
            <Link
              href={slide.link}
              className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-0.5"
            >
              {slide.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === idx ? 'bg-white w-8' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}