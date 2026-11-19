import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import HomeServiceSlider from "@/components/HomeServiceSlider";
import {
  Briefcase,
  Building2,
  Code2,
  Heart,
  IdCard,
  Plane,
  ShoppingBag,
  Sun,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shree Shyam | Business, Digital & Lifestyle Services",
  description:
    "Your one-stop destination for GST and business solutions, solar installations, e-Mitra services, property, web design, weddings, and travel.",
};

const WHATSAPP_NUMBER = "919782147688";

const services = [
  {
    id: "gst-business",
    title: "GST & Business Solutions",
    description:
      "Complete GST registration, return filing, accounting, tax compliance, and business consultancy.",
    message: "Hello Shree Shyam, I am interested in GST & Business Solutions.",
    category: "Business",
    icon: Briefcase,
    gradient: "from-blue-800 via-blue-700 to-indigo-500",
  },
  {
    id: "solar",
    title: "Solar Installations",
    description:
      "Residential and commercial rooftop solar panel setup, subsidy assistance, and clean energy solutions.",
    message: "Hello Shree Shyam, I would like to enquire about Solar Installations.",
    category: "Clean energy",
    icon: Sun,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
  {
    id: "e-mitra",
    title: "e-Mitra Services",
    description:
      "Fast and reliable government citizen services, document applications, certificates, and online portal support.",
    message: "Hello Shree Shyam, I need assistance with e-Mitra Services.",
    category: "Digital services",
    icon: IdCard,
    gradient: "from-cyan-700 via-sky-600 to-blue-500",
  },
  {
    id: "property",
    title: "Property Opportunities",
    description:
      "Verified residential, commercial, and investment property deals with transparent documentation support.",
    message: "Hello Shree Shyam, I want to know more about Property Opportunities.",
    category: "Real estate",
    icon: Building2,
    gradient: "from-emerald-800 via-emerald-600 to-teal-400",
  },
  {
    id: "web-design",
    title: "Website & Application Designing Services",
    description:
      "Custom business websites, web portals, accounting tools, and mobile-ready applications tailored to your brand.",
    message:
      "Hello Shree Shyam, I am looking for Website & Application Designing Services.",
    category: "Technology",
    icon: Code2,
    gradient: "from-violet-800 via-purple-700 to-fuchsia-500",
  },
  {
    id: "wedding",
    title: "Wedding Planning",
    description:
      "End-to-end event management, venue coordination, decor, and seamless wedding execution.",
    message: "Hello Shree Shyam, I would like to discuss Wedding Planning services.",
    category: "Celebrations",
    icon: Heart,
    gradient: "from-rose-700 via-pink-600 to-amber-400",
  },
  {
    id: "travel",
    title: "Tours & Travels",
    description:
      "Customized holiday packages, family trips, pilgrimage tours, and hassle-free travel bookings across India.",
    message: "Hello Shree Shyam, I am interested in Tours & Travels packages.",
    category: "Travel",
    icon: Plane,
    gradient: "from-teal-800 via-cyan-700 to-sky-400",
  },
  {
    id: "shop",
    title: "Online Shop",
    description:
      "Browse products, accessories, appliances, electronics, and everyday essentials from our online store.",
    category: "E-commerce",
    icon: ShoppingBag,
    gradient: "from-orange-700 via-amber-600 to-yellow-400",
    href: "/shop",
  },
] as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M20.52 3.48A11.83 11.83 0 0 0 12.08 0C5.5 0 .15 5.34.15 11.92c0 2.1.55 4.15 1.59 5.96L.05 24l6.27-1.64a11.9 11.9 0 0 0 5.76 1.47h.01c6.57 0 11.92-5.35 11.92-11.93 0-3.18-1.24-6.17-3.49-8.42ZM12.09 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.23-.37a9.89 9.89 0 0 1-1.52-5.27c0-5.49 4.47-9.96 9.97-9.96a9.9 9.9 0 0 1 7.05 2.92 9.9 9.9 0 0 1 2.91 7.06c0 5.5-4.47 9.96-9.96 9.96Zm5.47-7.46c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.38.2 1.9.12.58-.09 1.75-.72 2-1.42.25-.7.25-1.3.17-1.42-.08-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export default function Home() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <div className="home-page min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="bg-slate-950 text-slate-300">
          <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span className="font-medium tracking-wide text-slate-400">
              SHREE SHYAM <span className="px-1.5 text-amber-300">•</span> TONK, RAJASTHAN
            </span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <a className="inline-flex items-center gap-2 transition hover:text-white" href={`tel:+${WHATSAPP_NUMBER}`}>
                <Phone aria-hidden="true" className="h-3.5 w-3.5 text-amber-300" />
                +91 97821 47688
              </a>
              <a className="inline-flex items-center gap-2 transition hover:text-white" href="mailto:rv.afflatus@gmail.com">
                <Mail aria-hidden="true" className="h-3.5 w-3.5 text-amber-300" />
                rv.afflatus@gmail.com
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex shrink-0 items-center gap-3" aria-label="Shree Shyam home">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-black tracking-tight text-amber-300 shadow-sm">
              SS
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Shree Shyam
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a className="transition hover:text-blue-700" href="#services">Our Services</a>
            <a className="transition hover:text-blue-700" href="#about">About Us</a>
            <Link className="transition hover:text-blue-700" href="/shop">Online Shop</Link>
          </nav>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 sm:px-5"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Contact on WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </header>

      <main>
        <HomeServiceSlider />
        <section className="relative isolate overflow-hidden bg-slate-50">
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-36 -top-40 h-[32rem] w-[32rem] rounded-full bg-blue-100/70 blur-3xl" />
            <div className="absolute -bottom-56 left-0 h-[30rem] w-[30rem] rounded-full bg-amber-100/60 blur-3xl" />
          </div>
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-32">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Your trusted local service partner
              </span>
              <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                One partner for{" "}
                <span className="text-blue-800">business, digital, solar, property</span>{" "}
                &amp; lifestyle services.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                From business compliance and clean energy to travel and celebrations,
                Shree Shyam brings the services you need together in one place.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  Explore Our Services
                  <span aria-hidden="true">↓</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:border-green-200 hover:text-green-700"
                >
                  <WhatsAppIcon className="h-5 w-5 text-green-600" />
                  Talk to our team
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-slate-200 pt-6 text-sm font-medium text-slate-600">
                <span><strong className="mr-2 text-blue-800">08</strong>service areas</span>
                <span><strong className="mr-2 text-blue-800">01</strong>trusted partner</span>
                <span><strong className="mr-2 text-emerald-700">Local</strong>support you can reach</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-blue-100 via-white to-amber-100 blur-xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">SHREE SHYAM</p>
                    <p className="mt-1 text-xl font-bold text-slate-950">Services at a glance</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl" aria-hidden="true">
                    ✦
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {services.map((service) => (
                    "href" in service ? (
                      <Link
                        key={service.id}
                        href={service.href}
                        className="col-span-2 flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${service.gradient} text-white`}>
                          <service.icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <span className="text-sm font-semibold leading-snug text-slate-700">{service.title}</span>
                      </Link>
                    ) : (
                      <a
                        key={service.id}
                        href={`#${service.id}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${service.gradient} text-white`}>
                          <service.icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <span className="text-sm font-semibold leading-snug text-slate-700">{service.title}</span>
                      </a>
                    )
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700">
                    <WhatsAppIcon className="h-4 w-4" />
                  </span>
                  <span>Friendly guidance, just one message away.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-8 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">How we can help</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Services for every step forward
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Practical expertise and personal support for your business, home, and next adventure.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <article
                  key={service.id}
                  id={service.id}
                  className="group scroll-mt-8 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/10"
                >
                  <div className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${service.gradient}`}>
                    <span aria-hidden="true" className="absolute -right-7 -top-14 h-48 w-48 rounded-full border border-white/15" />
                    <span aria-hidden="true" className="absolute -bottom-28 -left-12 h-52 w-52 rounded-full border border-white/15" />
                    <span className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
                      {service.category}
                    </span>
                    <span className="absolute right-5 top-5 text-sm font-semibold text-white/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm transition duration-300 group-hover:scale-110">
                      <service.icon aria-hidden="true" className="h-10 w-10" strokeWidth={1.5} />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="min-h-14 text-xl font-bold leading-7 text-slate-950">
                      {service.title}
                    </h3>
                    <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>
                    {"href" in service ? (
                      <Link
                        href={service.href}
                        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                      >
                        <service.icon aria-hidden="true" className="h-5 w-5" />
                        Visit Online Shop
                        <span aria-hidden="true" className="ml-auto">→</span>
                      </Link>
                    ) : (
                      <a
                        href={`${whatsappUrl}?text=${encodeURIComponent(service.message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                      >
                        <WhatsAppIcon className="h-5 w-5" />
                        Enquire on WhatsApp
                        <span aria-hidden="true" className="ml-auto">↗</span>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">About Shree Shyam</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Local expertise, with your goals at the center.
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                We connect people and businesses with dependable services, straightforward guidance,
                and a team that is ready to help.
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-800 px-5 py-3 font-semibold text-white transition hover:bg-blue-900"
            >
              Get in touch <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <a href="#" className="inline-flex items-center gap-3" aria-label="Shree Shyam home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black tracking-tight text-white">
                SS
              </span>
              <span className="text-xl font-bold">Shree Shyam</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Your one-stop destination for business, digital, solar, property, and lifestyle services.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Quick links</h2>
            <nav aria-label="Service quick links" className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <a
                  key={service.id}
                  href={`#${service.id}`}
                  className="text-slate-400 transition hover:text-white"
                >
                  {service.title}
                </a>
              ))}
              <Link href="/services" className="text-slate-400 transition hover:text-white">e-Mitra Portals</Link>
            </nav>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Shree Shyam. All rights reserved.
        </div>
      </footer>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Shree Shyam on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-xl shadow-green-900/25 transition hover:scale-105 hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700 sm:bottom-7 sm:right-7 sm:h-16 sm:w-16"
      >
        <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      </a>
    </div>
  );
}