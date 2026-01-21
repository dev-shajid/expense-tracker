import DockMenu from "@/components/dock-menu";
import Header from "@/components/header";
import { QueryProvider } from "@/contexts/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <QueryProvider>
        <Header />
        <main className="container py-2 flex-1 pb-28 md:pb-2">
          {children}
        </main>
        <DockMenu />
      </QueryProvider>
    </div>
  );
}
