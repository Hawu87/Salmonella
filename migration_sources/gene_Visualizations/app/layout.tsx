import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Virulence Insights",
  description: "Discover patterns in Campylobacter virulence genes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
