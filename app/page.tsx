// app/page.tsx
import Navbar from '@/components/Navbar'
import HeroSlider from '@/components/HeroSlider'
import Link from 'next/link'

// Mock top products (ready to be swapped with Google Sheets data)
const topProducts = [
  { id: 1, title: "Aesthetic Wall Poster Set (Pack of 12)", price: "₹399", originalPrice: "₹899", image: "/placeholder-poster.jpg", category: "Wall Posters" },
  { id: 2, title: "Motivational Quotes Glossy Prints", price: "₹199", originalPrice: "₹499", image: "/placeholder-poster2.jpg", category: "Wall Posters" },
  { id: 3, title: "Customized Photo Frame Gift Set", price: "₹599", originalPrice: "₹999", image: "/placeholder-gift.jpg", category: "Gifts" },
  { id: 4, title: "Jan Aadhaar & Document Assist Card", price: "₹99", originalPrice: "₹199", image: "/placeholder-service.jpg", category: "Digital Services" },
]

const categories = [
  { name: "Wall Posters", count: "45+ Designs", icon: "🖼️", link: "/category/wall-posters" },
  { name: "Gift Items", count: "20+ Products", icon: "🎁", link: "/category/gifts" },
  { name: "Digital Services", count: "Kiosk & Portal", icon: "💻", link: "/category/services" },
  { name: "B2B Wholesale", count: "Bulk Pricing", icon: "📦", link: "/login" },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 space-y-8">
        
        {/* 1. Hero Auto-Sliding Banner */}
        <HeroSlider />

        {/* 2. Top Products Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Top Products & Best Sellers</h2>
            <Link href="/shop" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {topProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                  [Product Image]
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-xs text-amber-600 font-semibold mb-1">{product.category}</span>
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-grow">{product.title}</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-base font-bold text-gray-900">{product.price}</span>
                    <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Top Categories Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                href={cat.link}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition flex items-center space-x-4 group"
              >
                <span className="text-3xl p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition">{cat.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">{cat.name}</h3>
                  <p className="text-xs text-gray-500">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 space-y-2">
          <p className="font-semibold text-gray-800">ShreeShyams.in — Powered by Shri Shyam E-Mitra & Digital Services</p>
          <p>Secure B2B Transactions, Fast Shipping Across India, and Trusted Customer Support.</p>
          <p className="text-xs text-gray-400 pt-4">© 2026 ShreeShyams.in. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}