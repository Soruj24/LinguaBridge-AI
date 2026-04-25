"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Globe, 
  Mic, 
  ShieldCheck, 
  Zap, 
  Users 
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { motion } from "framer-motion";

export default function Home() {
  const t = useTranslations('Landing');

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-0 [padding-bottom:env(safe-area-inset-bottom)]">
      <FeedbackDialog />
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">LinguaBridge AI</span>
        </Link>
        <nav className="ml-auto flex gap-6 sm:gap-8">
          <Link className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-lg transition-all underline-offset-4 hover:underline" href="#features">
            {t('header.features')}
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-lg transition-all underline-offset-4 hover:underline" href="#how-it-works">
            {t('header.howItWorks')}
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium">
              {t('header.login')}
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-28 lg:py-40 px-4 md:px-6 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[10%] -right-[10%] w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent rounded-full blur-[120px] animate-spin" style={{ animationDuration: "25s" }} />
          </div>
          <div className="container mx-auto flex flex-col items-center space-y-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
                {t('hero.title')}
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg lg:text-xl">
                {t('hero.subtitle')}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all">
                  {t('hero.getStarted')}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 hover:bg-muted/50 transition-colors">
                  {t('hero.signIn')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-28 lg:py-40 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {t('features.keyFeatures')}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('features.title')}
                </h2>
                <p className="mx-auto max-w-[900px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                  {t('features.description')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-10 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<MessageSquare className="h-10 w-10" />}
                title={t('features.cards.chat.title')}
                description={t('features.cards.chat.description')}
                index={0}
              />
              <FeatureCard 
                icon={<Mic className="h-10 w-10" />}
                title={t('features.cards.voice.title')}
                description={t('features.cards.voice.description')}
                index={1}
              />
              <FeatureCard 
                icon={<Globe className="h-10 w-10" />}
                title={t('features.cards.autoDetect.title')}
                description={t('features.cards.autoDetect.description')}
                index={2}
              />
              <FeatureCard 
                icon={<Users className="h-10 w-10" />}
                title={t('features.cards.globalConnect.title')}
                description={t('features.cards.globalConnect.description')}
                index={3}
              />
              <FeatureCard 
                icon={<Zap className="h-10 w-10" />}
                title={t('features.cards.lightningFast.title')}
                description={t('features.cards.lightningFast.description')}
                index={4}
              />
              <FeatureCard 
                icon={<ShieldCheck className="h-10 w-10" />}
                title={t('features.cards.secure.title')}
                description={t('features.cards.secure.description')}
                index={5}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-16 md:py-28 lg:py-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('howItWorks.title')}
                </h2>
                <p className="mx-auto max-w-[900px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                  {t('howItWorks.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-4xl items-center gap-8 py-10 lg:grid-cols-3 lg:gap-12">
              <StepCard step={1} title={t('howItWorks.steps.1.title')} description={t('howItWorks.steps.1.description')} />
              <StepCard step={2} title={t('howItWorks.steps.2.title')} description={t('howItWorks.steps.2.description')} />
              <StepCard step={3} title={t('howItWorks.steps.3.title')} description={t('howItWorks.steps.3.description')} />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="w-full py-16 md:py-28 lg:py-40 bg-gradient-to-b from-muted/30 to-transparent">
           <div className="container mx-auto px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
               <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                 {t('about.title')}
               </h2>
               <p className="mx-auto max-w-[800px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                 {t('about.description')}
               </p>
             </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-28 lg:py-40 border-t bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('cta.title')}
                </h2>
                <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                  {t('cta.subtitle')}
                </p>
              </div>
              <div className="w-full max-w-sm space-y-3">
                <Link href="/register">
                  <Button className="w-full h-12 text-base" size="lg">
                    {t('cta.signUp')}
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  {t('cta.noCreditCard')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} LinguaBridge AI. {t('footer.rights')}
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            {t('footer.terms')}
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            {t('footer.privacy')}
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="flex flex-col items-center space-y-3 border p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer group bg-gradient-to-br from-card to-card/50"
    >
      <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-2 group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">
        {description}
      </p>
    </motion.div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: step * 0.1 }}
      className="flex flex-col items-center space-y-4 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
        {step}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}
