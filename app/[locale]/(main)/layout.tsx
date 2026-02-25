import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>
      <main className="flex-1 w-full h-full overflow-hidden flex flex-col relative pb-16 md:pb-0 [padding-bottom:env(safe-area-inset-bottom)]">
        {children}
        <MobileNav />
      </main>
    </div>
  );
}
