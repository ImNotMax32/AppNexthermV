import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Header from './header';
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col gap-20">
              {children}
            </div>
            <footer className="w-full border-t bg-white mt-auto">
              <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2">
                  <img src="/assets/img/X.png" alt="Nextherm Logo" className="w-8 aspect-square object-contain" />
                  <span className="text-gray-600">© 2024 Nextherm. Tous droits réservés.</span>
                </div>
                <div className="text-sm text-gray-500">
                  Expert en solutions de pompes à chaleur depuis plus de 20 ans
                </div>
                <div className="text-sm text-gray-500">
                  <Link href="/mentions-legales" className="hover:text-[#86BC29]">Mentions légales</Link>
                  <span className="mx-2">|</span>
                  <Link href="/confidentialite" className="hover:text-[#86BC29]">Confidentialité</Link>
                </div>
              </div>
            </footer>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}