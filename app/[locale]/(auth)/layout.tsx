import { Globe, MessageSquare, ShieldCheck, Zap } from "lucide-react";

const features = [
  { icon: MessageSquare, text: "Real-time translation in 50+ languages" },
  { icon: Zap, text: "AI-powered voice & text translation" },
  { icon: ShieldCheck, text: "End-to-end encrypted conversations" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* ambient bg */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-gradient-to-tl from-blue-500/8 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "8s" }} />
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/85 to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)] opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* floating orbs */}
        <div className="absolute top-[15%] right-[20%] w-64 h-64 bg-white/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-[20%] left-[10%] w-48 h-48 bg-white/5 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: "9s", animationDelay: "2s" }} />

        <div className="relative z-10 space-y-10">
          {/* brand */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/20">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LinguaBridge AI</span>
          </div>

          {/* hero text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Break language barriers,<br />
              <span className="text-white/80">connect globally.</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md leading-relaxed">
              Chat seamlessly in any language with AI-powered translation.
              Your voice, understood everywhere.
            </p>
          </div>

          {/* feature list */}
          <div className="space-y-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 shrink-0">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white/80 text-sm">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* bottom testimonial */}
        <div className="relative z-10 space-y-4">
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-full bg-white/15 ring-2 ring-white/30 flex items-center justify-center text-sm font-bold text-white"
              >
                {["SC", "MR", "AP"][i]}
              </div>
            ))}
          </div>
          <p className="text-white/60 text-sm italic max-w-md">
            &ldquo;LinguaBridge has transformed how I communicate with clients across Asia.&rdquo;
          </p>
          <p className="text-white/50 text-xs">Trusted by 50,000+ users worldwide</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* floating badge */}
        <div className="absolute top-6 right-6 hidden lg:flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-medium text-primary">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          AI-Powered
        </div>

        <div className="w-full max-w-md">
          {/* mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              LinguaBridge AI
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
