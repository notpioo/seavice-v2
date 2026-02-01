import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-2">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          <CarouselItem>
            <div className="p-1">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-400 to-orange-500 text-white overflow-hidden rounded-3xl h-[200px] sm:h-[300px] relative">
                <CardContent className="flex h-full items-center justify-between p-6 sm:p-12 relative z-10">
                  <div className="max-w-md space-y-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                      Special Offer
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-display font-bold leading-tight">
                      Super Deal <br/> 50% Off
                    </h2>
                    <p className="text-orange-50 text-sm sm:text-base hidden sm:block">
                      Get premium data packages at half price this weekend only.
                    </p>
                    <Button variant="secondary" className="mt-4 bg-white text-orange-600 hover:bg-orange-50 border-0">
                      Shop Now
                    </Button>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -right-20 -bottom-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="p-1">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden rounded-3xl h-[200px] sm:h-[300px] relative">
                <CardContent className="flex h-full items-center justify-between p-6 sm:p-12 relative z-10">
                  <div className="max-w-md space-y-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                      New Arrival
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-display font-bold leading-tight">
                      Pay Bills <br/> Easily
                    </h2>
                    <Button variant="secondary" className="mt-4 bg-white text-indigo-600 hover:bg-indigo-50 border-0">
                      Pay Now
                    </Button>
                  </div>
                  <div className="absolute -right-20 -top-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        {/* Navigation buttons hidden on mobile */}
        <div className="hidden sm:block">
          <CarouselPrevious className="left-4 bg-white/80 backdrop-blur border-0 hover:bg-white text-gray-800" />
          <CarouselNext className="right-4 bg-white/80 backdrop-blur border-0 hover:bg-white text-gray-800" />
        </div>
      </Carousel>
    </div>
  );
}
