import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Shafique Ahmed — CS Student & Aspiring Software Engineer", template: "%s | Shafique Ahmed" },
  description: "Portfolio of Shafique Ahmed — 7th semester CS student, full-stack developer, and aspiring software engineer based in Sukkur, Pakistan.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Shafique Ahmed",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                fontFamily: "DM Sans, sans-serif",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
