import DockMenu from "@/components/dock-menu";
import Header from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container py-2 flex-1">
        {children}
      </main>
      <DockMenu/>
    </div>
  );
}
