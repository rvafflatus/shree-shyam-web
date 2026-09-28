// app/coupon-form/page.tsx
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function CouponFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold uppercase px-3 py-1 rounded-full">
            🎁 First-Purchase Special
          </span>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Get Your Exclusive Coupon Code
          </h1>
          
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            We are setting up this registration form. Soon, you will be able to fill out your details here to receive an instant discount code for your first order at ShreeShyams.in!
          </p>

          <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm max-w-md mx-auto">
            <p className="font-semibold mb-1">💡 Under Consideration:</p>
            <p>This form will soon be integrated via Google Forms, WhatsApp, or our secure database.</p>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-block bg-gray-900 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition duration-300"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>© 2026 ShreeShyams.in. All rights reserved.</p>
      </footer>
    </div>
  )
}