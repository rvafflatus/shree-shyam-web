// components/HeroSlider.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const slides = [
  {
    id: 1,
    title: "Best Prices on Electrical & Electronics",
    subtitle: "Explore high-efficiency solar systems, smart robotics kits, and reliable electronic essentials at unbeatable rates.",
    bg: "from-blue-700 via-indigo-800 to-amber-600",
    badge: "⚡ Solar & Robotics Special",
    cta: "Explore Electronics",
    link: "/category/electronics",
    graphic: "⚡🤖",
  },
  {
    id: 2,
    title: "Custom Software Development Solutions",
    subtitle: "Empower your business with high-performance web applications, e-commerce stores, and custom software tailored for growth.",
    bg: "from-slate-900 via-indigo-950 to-blue-900",
    badge: "💻 Tech & App Solutions",
    cta: "View Services",
    link: "/category/software",
    graphic: "💻🚀",
  },
  {
    id: 3,
    title: "Shree Shyam E-Mitra, Jawahar Bazar, Tonk",
    subtitle: "Your Trusted Public Service Center for Jan Aadhaar, PAN Cards, GST Registration, and all Government & Accounting Work.",
    bg: "from-amber-700 via-orange-800 to-red-800",
    badge: "🏛️ Official Govt. & Kiosk Services",
    cta: "Visit Portal",
    link: "/category/services",
    graphic: "🛡️📋",
  },
  {
    id: 4,
    title: "Special First-Purchase Discount!",
    subtitle: "Get exclusive coupon codes for your very first order by filling out our quick customer form. Save big today!",
    bg: "from-emerald-700 via-teal-800 to-cyan-900",
    badge: "🎁 Welcome Offer",
    cta: "Get Coupon Code",
    link: "/coupon-form", // Points to the form we will build later
    graphic: "🎟️✨",
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
            className={`w-full flex-shrink-0 bg-gradient-to-r ${slide.bg} text-white py-16 px-8 md:py-24 md:px-16 flex flex-col items-start justify-center min-h-[340px] md:min-h-[400px] relative`}
          >
            {/* Graphic symbol overlay for visual flair */}
            <div className="absolute right-6 bottom-6 md:right-16 md:bottom-12 opacity-20 text-7xl md:text-9xl select-none pointer-events-none">
              {slide.graphic}
            </div>

            <span className="bg-white/20 text-xs md:text-sm uppercase tracking-widest px-3 py-1 rounded-full mb-4 backdrop-blur-md">
              {slide.badge}
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