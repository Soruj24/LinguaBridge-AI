"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkillRadarProps {
  className?: string;
}

const defaultSkills = [
  { name: "Vocabulary", value: 85, color: "#8b5cf6" },
  { name: "Grammar", value: 72, color: "#ec4899" },
  { name: "Pronunciation", value: 68, color: "#06b6d4" },
  { name: "Listening", value: 90, color: "#10b981" },
  { name: "Writing", value: 65, color: "#f59e0b" },
  { name: "Speaking", value: 78, color: "#ef4444" },
];

export function SkillRadar({ className }: SkillRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skills = defaultSkills;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 20;

      ctx.clearRect(0, 0, width, height);

      const numSkills = skills.length;
      const angleStep = (Math.PI * 2) / numSkills;

      ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
      ctx.lineWidth = 1;

      for (let level = 1; level <= 5; level++) {
        ctx.beginPath();
        for (let i = 0; i <= numSkills; i++) {
          const angle = angleStep * i - Math.PI / 2;
          const r = (radius * level) / 5;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(angle),
          centerY + radius * Math.sin(angle)
        );
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(
        centerX +
          (radius * (skills[0].value / 100)) *
            Math.cos(angleStep * 0 - Math.PI / 2),
        centerY +
          (radius * (skills[0].value / 100)) *
            Math.sin(angleStep * 0 - Math.PI / 2)
      );

      for (let i = 1; i <= numSkills; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const skill = skills[i % numSkills];
        ctx.lineTo(
          centerX + (radius * (skill.value / 100)) * Math.cos(angle),
          centerY + (radius * (skill.value / 100)) * Math.sin(angle)
        );
      }
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.4)");
      gradient.addColorStop(1, "rgba(139, 92, 246, 0.1)");
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = "rgba(139, 92, 246, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = centerX + (radius * (skill.value / 100)) * Math.cos(angle);
        const y = centerY + (radius * (skill.value / 100)) * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = skill.color;
        ctx.fill();
      });
    };

    draw();
  }, [skills]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Language Skills</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative aspect-square">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground px-2">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex flex-col items-center"
              >
                <span className="font-medium text-foreground">{skill.value}%</span>
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}