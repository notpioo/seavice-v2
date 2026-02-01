import { Smartphone, Wifi, Zap, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const services = [
  { icon: Smartphone, label: "Pulsa", color: "bg-blue-50 text-blue-600", href: "/ppob/pulsa" },
  { icon: Wifi, label: "Kuota", color: "bg-green-50 text-green-600", href: "/ppob/kuota" },
  { icon: Zap, label: "PLN", color: "bg-yellow-50 text-yellow-600", href: "/ppob/pln" },
  { icon: LayoutGrid, label: "Lainnya", color: "bg-orange-50 text-orange-600", href: "#" },
];

export function ServiceMenu() {
  return (
    <section className="py-6 px-4 bg-white border-b border-gray-100">
      <div className="container mx-auto">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 max-w-6xl mx-auto">
          {services.map((item, index) => (
            <Link key={item.label} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center 
                  shadow-sm border border-black/5 ${item.color}
                  group-hover:shadow-md transition-all duration-300
                `}>
                  <item.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
