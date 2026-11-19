"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CodeXml,
  IdCard,
  ShoppingBag,
  Sun,
} from "lucide-react";

const slides = [
  {
    eyebrow: "Business, made simpler",
    title: "Focus on growth. Leave compliance to us.",
    description:
      "GST registration, return filing, accounting, and practical business support — all in one place.",
    label: "GST & Business",
    href: "/#gst-business",
    icon: BriefcaseBusiness,
    accent: "from-blue-500/30 via-blue-400/10 to-transparent",
    number: "01",
  },
  {
    eyebrow: "A brighter way to power your home",
    title: "Make the switch to clean solar energy.",
    description:
      "Explore rooftop solar installations, subsidy assistance, and dependable support from start to finish.",
    label: "Solar Installations",
    href: "/#solar",
    icon: Sun,
    accent: "from-amber-400/30 via-orange-400/10 to-transparent",
    number: "02",
  },
  {
    eyebrow: "Digital help, close to home",
    title: "Everyday online services, made easy.",
    description:
      "Get help with citizen services, document applications, certificates, and online portals.",
    label: "e-Mitra Services",
    href: "/#e-mitra",
    icon: IdCard,
    accent: "from-cyan-400/30 via-sky-400/10 to-transparent",
    number: "03",
  },
  {
    eyebrow: "Thoughtful technology for business",
    title: "Digital experiences built around you.",
    description:
      "From a professional website to a custom portal, turn your ideas into useful digital tools.",
    label: "Website & App Design",
    href: "/#web-design",
    icon: CodeXml,
    accent: "from-violet-400/30 via-fuchsia-400/10 to-transparent",
    number: "04",
  },
  {
    eyebrow: "Discover something useful",
    title: "Good finds, just a click away.",
    description:
      "Browse electronics, home essentials, accessories, and more in the Shree Shyam online shop.",
    label: "Online Shop",
    href: "/shop",
    icon: ShoppingBag,
    accent: "from-rose-400/30 via-amber-400/10 to-transparent",
    number: "05",
  },
];

export default function HomeServiceSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((slide) => (slide + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [paused]);

  const showPrevious = () => {
    setCurrent((slide) => (slide - 1 + slides.length) % slides.length);
  };

  const showNext = () => {
    setCurrent((slide) => (slide + 1) % slides.length);
  };

  return (
    <section
      aria-label="Featured Shree Shyam services"
      aria-roledescription="carousel"
      className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setPaused(false);
        }
      }}
    >
      <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-2xl shadow-slate-900/15">
        <div
          className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <article
              key={slide.number}
              aria-label={`${index + 1} of ${slides.length}: ${slide.label}`}
              aria-hidden={current !== index}
              className="relative flex min-h-[390px] w-full shrink-0 items-center overflow-hidden px-6 py-12 text-white sm:px-12 sm:py-14 lg:min-h-[420px] lg:px-16"
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br ${slide.accent} blur-2xl`}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-48 left-1/3 h-80 w-80 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-36 left-[38%] h-64 w-64 rounded-full border border-white/10"
              />

              <div className="relative z-10 grid w-full items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 sm:text-sm">
                    <span className="h-px w-8 bg-amber-300" />
                    {slide.eyebrow}
                  </div>
                  <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    {slide.description}
                  </p>
                  <Link
                    href={slide.href}
                    tabIndex={current === index ? undefined : -1}
                    className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {slide.label}
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>

                <div className="relative hidden min-h-56 items-center justify-center md:flex">
                  <div
                    aria-hidden="true"
                    className="absolute h-56 w-56 rounded-full border border-white/10"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute h-40 w-40 rounded-full border border-white/15"
                  />
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/15 bg-white/[0.07] shadow-2xl backdrop-blur">
                    <slide.icon
                      aria-hidden="true"
                      className="h-14 w-14 text-amber-200"
                      strokeWidth={1.25}
                    />
                  </div>
                  <span className="absolute right-4 top-4 text-7xl font-light tracking-tighter text-white/[0.08] lg:right-12 lg:text-8xl">
                    {slide.number}
                  </span>
                  <span className="absolute bottom-1 right-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-slate-300 backdrop-blur lg:right-10">
                    SHREE SHYAM · TONK
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="absolute bottom-4 left-6 flex items-center gap-2 sm:left-12 lg:left-16">
          {slides.map((slide, index) => (
            <button
              key={slide.number}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Show ${slide.label}`}
              aria-current={current === index}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                current === index ? "w-8 bg-amber-300" : "w-3 bg-white/35 hover:bg-white/70"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous featured service"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Next featured service"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
