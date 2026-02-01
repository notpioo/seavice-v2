import { Star, Plus } from "lucide-react";
import { useProducts } from "@/hooks/use-shop";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function ProductGrid() {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 sm:h-56 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group relative bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300"
        >
          {/* Image Container */}
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Fallback image if broken
                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/orange/white?text=${encodeURIComponent(product.name)}`;
              }}
            />
            {/* Quick Add Button */}
            <button className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:bg-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating}</span>
            </div>
            
            <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] text-sm sm:text-base leading-tight">
              {product.name}
            </h3>
            
            <div className="pt-2 flex items-center justify-between">
              <span className="font-bold font-display text-lg text-gray-900">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
