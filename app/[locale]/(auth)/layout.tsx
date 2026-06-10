import { Globe, MessageSquare, ShieldCheck, Zap } from "lucide-react";

const features = [
  { icon: MessageSquare, text: "Real-time translation in 50+ languages" },
  { icon: Zap, text: "AI-powered voice & text translation" },
  { icon: ShieldCheck, text: "End-to-end encrypted conversations" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 bg-primary text-white">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">LinguaBridge AI</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight">
              Break language barriers,<br />
              <span className="text-white/80">connect globally.</span>
            </h1>
            <p className="text-white/70 text-base max-w-md">
              Chat seamlessly in any language with AI-powered translation.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-white/80 text-sm">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-white/60 text-sm italic max-w-md">
            &ldquo;LinguaBridge has transformed how I communicate with clients across Asia.&rdquo;
          </p>
          <p className="text-white/50 text-xs">Trusted by 50,000+ users worldwide</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">LinguaBridge AI</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
