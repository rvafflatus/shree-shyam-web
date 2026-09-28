// app/page.tsx
import Navbar from '@/components/Navbar'
import HeroSlider from '@/components/HeroSlider'
import Link from 'next/link'

// Mock top products (ready to be swapped with Google Sheets data later)
const topProducts = [
  { id: 1, title: "Aesthetic Wall Poster Set (Pack of 12)", price: "₹399", originalPrice: "₹899", image: "/placeholder-poster.jpg", category: "Wall Posters" },
  { id: 2, title: "Motivational Quotes Glossy Prints", price: "₹199", originalPrice: "₹499", image: "/placeholder-poster2.jpg", category: "Wall Posters" },
  { id: 3, title: "Customized Photo Frame Gift Set", price: "₹599", originalPrice: "₹999", image: "/placeholder-gift.jpg", category: "Gifts" },
  { id: 4, title: "Jan Aadhaar & Document Assist Card", price: "₹99", originalPrice: "₹199", image: "/placeholder-service.jpg", category: "Digital Services" },
]

// Updated categories matching your exact business requirements
const categories = [
  { 
    name: "Mobile Phones & Accessories", 
    count: "Latest Models & Cases", 
    icon: "📱", 
    link: "/category/mobile-accessories" 
  },
  { 
    name: "Inverter & Battery", 
    count: "Power Backup Solutions", 
    icon: "🔋", 
    link: "/category/inverter-battery" 
  },
  { 
    name: "Home Appliances", 
    count: "Smart & Daily Essentials", 
    icon: "🏡", 
    link: "/category/home-appliances" 
  },
  { 
    name: "Motors & Submersible Pumps", 
    count: "Agricultural & Domestic", 
    icon: "⚙️", 
    link: "/category/motors-pumps" 
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 space-y-12">
        
        {/* 1. Hero Auto-Sliding Banner */}
        <HeroSlider />

        {/* 2. Top Products Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Top Products & Best Sellers</h2>
            <Link href="/shop" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {topProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  [Product Image]
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">{product.category}</span>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 flex-grow">{product.title}</h3>
                  <div className="flex items-baseline space-x-2 mb-3">
                    <span className="text-base font-bold text-gray-900">{product.price}</span>
                    <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-sm">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Top Categories Section */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                href={cat.link}
                className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col items-start space-y-4 group"
              >
                <span className="text-3xl md:text-4xl p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 space-y-2">
          <p className="font-semibold text-gray-800">ShreeShyams.in — Powered by Shri Shyam E-Mitra & Digital Services</p>
          <p>Secure B2B Transactions, Fast Shipping Across India, and Trusted Customer Support.</p>
          <p className="text-xs text-gray-400 pt-4">© 2026 ShreeShyams.in. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}