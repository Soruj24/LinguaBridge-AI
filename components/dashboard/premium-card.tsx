import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function PremiumCard() {
  return (
    <Card className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="h-32 w-32" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Premium Plan
        </CardTitle>
        <CardDescription className="text-indigo-100">
          Unlock unlimited translations and voice features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">✓ Unlimited text translations</li>
            <li className="flex items-center gap-2">✓ High-quality voice output</li>
            <li className="flex items-center gap-2">✓ Priority support</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full font-semibold text-indigo-600 hover:bg-white/90" asChild>
          <Link href="/subscription">
            Upgrade Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
