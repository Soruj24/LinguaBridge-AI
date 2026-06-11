"use client";

import { Phone, PhoneOff } from "lucide-react";

interface IncomingCallDialogProps {
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallDialog({ callerName, onAccept, onReject }: IncomingCallDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="bg-background rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[300px]">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring">
            <Phone className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{callerName}</p>
          <p className="text-sm text-muted-foreground mt-1">Incoming call...</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onAccept}
            className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
          >
            <Phone className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={onReject}
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
