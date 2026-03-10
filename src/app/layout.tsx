import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav, FAB } from "@/components/layout/mobile-nav";

const inter = Inter({ subsets: ["latin"] });

export { inter };

export const metadata: Metadata = {
  title: "Status Go | Gestão de Força de Vendas",
  description: "Plataforma inteligente de gestão comercial B2B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-background/50 pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
          <FAB />
        </div>
      </body>
    </html>
  );
}
