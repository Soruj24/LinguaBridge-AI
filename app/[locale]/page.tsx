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

export default function Home() {
  const t = useTranslations('Landing');

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-0 [padding-bottom:env(safe-area-inset-bottom)]">
      <FeedbackDialog />
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <Link className="flex items-center justify-center" href="/">
          <Globe className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-xl">LinguaBridge AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            {t('header.features')}
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
            {t('header.howItWorks')}
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            {t('header.login')}
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 md:px-6">
          <div className="container mx-auto flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                {t('hero.title')}
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {t('hero.subtitle')}
              </p>
            </div>
            <div className="space-x-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-11 px-8">
                  {t('hero.getStarted')}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-11 px-8">
                  {t('hero.signIn')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  {t('features.keyFeatures')}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {t('features.title')}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('features.description')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<MessageSquare className="h-10 w-10 text-primary" />}
                title={t('features.cards.chat.title')}
                description={t('features.cards.chat.description')}
              />
              <FeatureCard 
                icon={<Mic className="h-10 w-10 text-primary" />}
                title={t('features.cards.voice.title')}
                description={t('features.cards.voice.description')}
              />
              <FeatureCard 
                icon={<Globe className="h-10 w-10 text-primary" />}
                title={t('features.cards.autoDetect.title')}
                description={t('features.cards.autoDetect.description')}
              />
              <FeatureCard 
                icon={<Users className="h-10 w-10 text-primary" />}
                title={t('features.cards.globalConnect.title')}
                description={t('features.cards.globalConnect.description')}
              />
              <FeatureCard 
                icon={<Zap className="h-10 w-10 text-primary" />}
                title={t('features.cards.lightningFast.title')}
                description={t('features.cards.lightningFast.description')}
              />
              <FeatureCard 
                icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                title={t('features.cards.secure.title')}
                description={t('features.cards.secure.description')}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {t('howItWorks.title')}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('howItWorks.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-bold">{t('howItWorks.steps.1.title')}</h3>
                <p className="text-muted-foreground">
                  {t('howItWorks.steps.1.description')}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="text-xl font-bold">{t('howItWorks.steps.2.title')}</h3>
                <p className="text-muted-foreground">
                  {t('howItWorks.steps.2.description')}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-bold">{t('howItWorks.steps.3.title')}</h3>
                <p className="text-muted-foreground">
                  {t('howItWorks.steps.3.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
           <div className="container mx-auto px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
               <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                 {t('about.title')}
               </h2>
               <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                 {t('about.description')}
               </p>
             </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('cta.title')}
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('cta.subtitle')}
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Link href="/register">
                  <Button className="w-full" size="lg">
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-2 bg-primary/10 rounded-full mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">
        {description}
      </p>
    </div>
  );
}
