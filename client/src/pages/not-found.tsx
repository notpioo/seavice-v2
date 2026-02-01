import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl shadow-gray-200/50">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-orange-500 items-center justify-center">
            <AlertCircle className="h-12 w-12" />
          </div>
          
          <h1 className="text-3xl font-bold text-center text-gray-900 font-display mb-2">
            Page Not Found
          </h1>
          
          <p className="mt-4 text-center text-gray-500 mb-8">
            Whoops! The page you are looking for seems to have wandered off.
          </p>

          <Link href="/" className="w-full">
            <Button className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/40">
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
