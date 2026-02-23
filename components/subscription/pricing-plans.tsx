"use client";

import { Check, X, Zap, Crown, Building2 } from "lucide-react";
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
      { name: "AI Tutor (Basic)", included: true },
    ],
    cta: "Upgrade Now",
    popular: true,
  },
  {
    name: "Business",
    price: "$49",
    period: "/month",
    description: "For teams and power users requiring more.",
    features: [
      { name: "Everything in Pro", included: true },
      { name: "AI Tutor (Advanced)", included: true },
      { name: "Dedicated Support", included: true },
      { name: "API Access", included: true },
      { name: "Team Management", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingPlans() {
  return (
    <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
      {plans.map((plan) => (
        <Card 
          key={plan.name} 
          className={cn(
            "relative flex flex-col transition-all duration-200 hover:shadow-xl",
            plan.popular ? "border-primary shadow-lg scale-105 z-10" : "border-border"
          )}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-primary to-purple-600 px-3 py-1 text-xs font-medium text-primary-foreground shadow-md">
              Most Popular
            </div>
          )}
          {plan.popular && (
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-primary/5 to-transparent blur-xl" />
          )}
          
          <CardHeader>
            <div className="flex items-center gap-2">
                {plan.name === "Free" && <Zap className="h-5 w-5 text-muted-foreground" />}
                {plan.name === "Pro" && <Crown className="h-5 w-5 text-primary" />}
                {plan.name === "Business" && <Building2 className="h-5 w-5 text-blue-500" />}
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
                <div key={feature.name} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/50" />
                  )}
                  <span className={cn(!feature.included && "text-muted-foreground")}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                size="lg"
            >
              {plan.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
