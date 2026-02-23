import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] bg-background relative overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 w-full h-full overflow-hidden flex flex-col relative">
        {children}
        <MobileNav />
      </main>
    </div>
  );
}
