"use client";

import { Check, X, Zap, Crown, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Essential features for casual users.",
    features: [
      { name: "Real-time translation", included: true },
      { name: "50 messages/day", included: true },
      { name: "Standard speed", included: true },
      { name: "Voice translation", included: false },
      { name: "AI Tutor", included: false },
    ],
    cta: "Current Plan",
    popular: false,
    icon: Zap,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Perfect for language learners and travelers.",
    features: [
      { name: "Real-time translation", included: true },
      { name: "Unlimited messages", included: true },
      { name: "Priority speed", included: true },
      { name: "Voice translation", included: true },
      { name: "AI Tutor", included: true },
    ],
    cta: "Upgrade Now",
    popular: true,
    icon: Crown,
  },
  {
    name: "Business",
    price: "$49",
    period: "/month",
    description: "For teams and power users requiring more.",
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Advanced AI Tutor", included: true },
      { name: "Dedicated Support", included: true },
      { name: "API Access", included: true },
      { name: "Team Management", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Building2,
  },
];

export function PricingPlans() {
  return (
    <div className="grid gap-8 md:grid-cols-3 lg:gap-12 items-start">
      {plans.map((plan) => (
        <div key={plan.name} className={cn("relative rounded-xl transition-all duration-300", plan.popular ? "p-[2px] bg-gradient-to-r from-primary via-purple-500 to-blue-500 shadow-2xl scale-105 z-10" : "border border-border")}>
           <Card 
            className={cn(
              "h-full border-0 shadow-none",
              plan.popular ? "bg-card/95 backdrop-blur-sm" : "bg-card"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-primary to-purple-600 px-4 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-2 rounded-lg", plan.popular ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    <plan.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <div className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-center gap-3">
                    <div className={cn("flex items-center justify-center h-5 w-5 rounded-full", feature.included ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground/50")}>
                      {feature.included ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </div>
                    <span className={cn(!feature.included && "text-muted-foreground")}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className={cn("w-full transition-all duration-300", plan.popular ? "bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:scale-[1.02]" : "")} 
                variant={plan.popular ? "default" : "outline"}
                size="lg"
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
}
