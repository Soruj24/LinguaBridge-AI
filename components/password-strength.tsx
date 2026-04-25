"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PasswordStrengthProps {
  password: string;
}

interface StrengthLevel {
  label: string;
  color: string;
  bgColor: string;
  score: number;
}

const strengthLevels: StrengthLevel[] = [
  { label: "Very Weak", color: "text-red-500", bgColor: "bg-red-500", score: 0 },
  { label: "Weak", color: "text-orange-500", bgColor: "bg-orange-500", score: 1 },
  { label: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500", score: 2 },
  { label: "Strong", color: "text-green-400", bgColor: "bg-green-400", score: 3 },
  { label: "Very Strong", color: "text-green-500", bgColor: "bg-green-500", score: 4 },
];

function calculateStrength(password: string): StrengthLevel {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return strengthLevels[Math.min(score, 4)];
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState<StrengthLevel>(strengthLevels[0]);

  useEffect(() => {
    if (password.length === 0) {
      setStrength(strengthLevels[0]);
    } else {
      setStrength(calculateStrength(password));
    }
  }, [password]);

  if (password.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              index <= strength.score ? strength.bgColor : "bg-muted"
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          />
        ))}
      </div>
      <p className={`text-xs ${strength.color}`}>
        {strength.label}
        {strength.score < 2 && (
          <span className="text-muted-foreground ml-1">
            (use uppercase, numbers, and symbols)
          </span>
        )}
      </p>
    </div>
  );
}

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-1.5">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2">
          {req.met ? (
            <svg
              className="h-4 w-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
            </svg>
          )}
          <span
            className={`text-xs ${
              req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            }`}
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}