// components/Navbar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top Announcement Bar */}
      <div className="bg-amber-600 text-white text-xs md:text-sm py-2 px-4 text-center font-medium">
        🔥 Special Launch Offer: Free Delivery Across India on Orders Above ₹499 | B2B Wholesale Active
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
              ShreeShyam<span className="text-amber-600">s.in</span>
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search posters, gifts, digital services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 text-sm bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-600">
                🔍
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition">
              B2B Portal Login
            </Link>
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600">
              🛒 <span className="absolute top-0 right-0 bg-amber-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">0</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 text-gray-700 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products & services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-blue-600"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
              🔍
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-3">
          <Link href="/" onClick={() => setIsOpen(false)} className="block text-gray-700 font-medium py-1">Home</Link>
          <Link href="/category/wall-posters" onClick={() => setIsOpen(false)} className="block text-gray-700 font-medium py-1">Wall Posters</Link>
          <Link href="/category/services" onClick={() => setIsOpen(false)} className="block text-gray-700 font-medium py-1">Digital Services</Link>
          <Link href="/login" onClick={() => setIsOpen(false)} className="block text-blue-600 font-semibold py-1">B2B Portal Login</Link>
          <Link href="/cart" onClick={() => setIsOpen(false)} className="block text-gray-700 font-medium py-1">Cart (0)</Link>
        </div>
      )}
    </header>
  )
}