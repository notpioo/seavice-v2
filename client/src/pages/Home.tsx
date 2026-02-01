import { Navbar } from "@/components/Navbar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ServiceMenu } from "@/components/ServiceMenu";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { ChevronRight, Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <HeroCarousel />
      
      {/* Quick Access Menu */}
      <ServiceMenu />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 space-y-10 max-w-6xl">
        
        {/* Promotional Banner (static) */}
        <div className="bg-gray-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-gray-200">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-display font-bold text-orange-300">New User Special</h3>
            <p className="text-gray-400 max-w-sm">Get 20% cashback on your first electricity bill payment. Valid until end of month.</p>
          </div>
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 font-semibold">
            Claim Offer
          </Button>
        </div>

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Flame className="w-5 h-5 fill-orange-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Trending Now</h2>
            </div>
            <Button variant="ghost" className="text-sm text-gray-500 hover:text-primary gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <ProductGrid />
        </section>

        {/* Category Promo */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gaming */}
          <div className="relative overflow-hidden h-40 rounded-2xl bg-indigo-600 p-6 flex items-center group cursor-pointer">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-1">Gaming Top-up</h3>
              <p className="text-indigo-200 text-sm mb-3">Instant delivery</p>
              <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                Shop Games
              </span>
            </div>
            {/* Unsplash abstract tech image */}
            <img 
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop&q=80" 
              alt="Gaming background" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Streaming */}
          <div className="relative overflow-hidden h-40 rounded-2xl bg-rose-600 p-6 flex items-center group cursor-pointer">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-1">Streaming Vouchers</h3>
              <p className="text-rose-200 text-sm mb-3">Watch everywhere</p>
              <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-rose-600 transition-colors">
                Subscribe
              </span>
            </div>
            {/* Unsplash abstract cinema image */}
            <img 
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop&q=80" 
              alt="Streaming background" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </section>

      </main>
    </div>
  );
}
