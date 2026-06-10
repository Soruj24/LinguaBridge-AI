"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SchedulePickerProps {
  onSchedule: (scheduledAt: string) => void;
  onSendNow: () => void;
}

export function SchedulePicker({ onSchedule, onSendNow }: SchedulePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSchedule = () => {
    if (!date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt <= new Date()) return;
    onSchedule(scheduledAt.toISOString());
    setOpen(false);
    setDate("");
    setTime("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Schedule message"
        >
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Schedule message</h4>
          <div className="space-y-2">
            <div>
              <label htmlFor="schedule-date" className="text-xs text-muted-foreground block mb-1">
                Date
              </label>
              <input
                id="schedule-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label htmlFor="schedule-time" className="text-xs text-muted-foreground block mb-1">
                Time
              </label>
              <input
                id="schedule-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full"
              disabled={!date || !time}
              onClick={handleSchedule}
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Schedule
            </Button>
            <button
              type="button"
              onClick={() => { onSendNow(); setOpen(false); }}
              className="text-xs text-muted-foreground hover:text-foreground text-center w-full"
            >
              Send now instead
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
