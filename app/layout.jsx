import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://litwaypicks.com";
const DESCRIPTION =
  "Shop the latest trends with free nationwide delivery across all 15 counties in Liberia.";

export const metadata = {
  title: "LitwayPicks — Liberia's Premier Online Store",
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "LitwayPicks",
    title: "LitwayPicks — Liberia's Premier Online Store",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "LitwayPicks — Liberia's Premier Online Store",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
