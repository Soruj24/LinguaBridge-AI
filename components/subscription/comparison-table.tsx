"use client";

import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    category: "Translation",
    items: [
      { name: "Real-time Text Translation", free: true, pro: true, business: true },
      { name: "Voice Translation", free: false, pro: true, business: true },
      { name: "Languages Supported", free: "5", pro: "50+", business: "100+" },
    ],
  },
  {
    category: "Usage Limits",
    items: [
      { name: "Messages per day", free: "50", pro: "Unlimited", business: "Unlimited" },
      { name: "Translation Speed", free: "Standard", pro: "Priority", business: "Instant" },
      { name: "History Retention", free: "7 days", pro: "30 days", business: "Unlimited" },
    ],
  },
  {
    category: "Advanced Features",
    items: [
      { name: "AI Tutor", free: false, pro: "Basic", business: "Advanced" },
      { name: "Context Awareness", free: false, pro: true, business: true },
      { name: "API Access", free: false, pro: false, business: true },
      { name: "Custom Vocabulary", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Support",
    items: [
      { name: "Customer Support", free: "Community", pro: "Email", business: "24/7 Priority" },
    ],
  },
];

export function ComparisonTable() {
  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-background shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="p-4 font-medium w-1/3">Feature</th>
            <th className="p-4 font-medium text-center w-1/6">Free</th>
            <th className="p-4 font-medium text-center w-1/6 bg-primary/5 text-primary border-t-2 border-primary relative">
              <span className="absolute -top-3 left-0 right-0 mx-auto w-fit bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Most Popular
              </span>
              Pro
            </th>
            <th className="p-4 font-medium text-center w-1/6">Business</th>
          </tr>
        </thead>
        <tbody>
          {features.map((section) => (
            <>
              <tr key={section.category} className="bg-muted/20 border-b">
                <td colSpan={4} className="p-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  {section.category}
                </td>
              </tr>
              {section.items.map((item, index) => (
                <tr key={item.name} className="border-b last:border-0 hover:bg-muted/5 transition-colors">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-center text-muted-foreground">
                    {renderValue(item.free)}
                  </td>
                  <td className="p-4 text-center font-medium bg-primary/5 border-x border-primary/10">
                    {renderValue(item.pro)}
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    {renderValue(item.business)}
                  </td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderValue(value: boolean | string) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <Minus className="h-5 w-5 text-muted-foreground/30 mx-auto" />
    );
  }
  return <span>{value}</span>;
}
