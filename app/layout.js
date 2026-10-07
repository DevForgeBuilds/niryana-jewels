import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ToastContainer from "@/components/ToastContainer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AuthProvider from "@/components/AuthProvider";

// Self-hosted, non-render-blocking fonts (replaces the old Google Fonts CSS @import
// for a faster first paint and no extra network round-trip).
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const SITE_URL = "https://niryana-jewels-iota.vercel.app";
const OG_IMAGE =
  "https://cdn.jsdelivr.net/gh/vrajpanadya/Niryana_Jewels@main/489830288_17871280257340781_7793304305361390330_n.jpg";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Niryana Jewels | Fine Jewellery with Heart & Heritage",
    template: "%s",
  },
  description:
    "Niryana Jewels — handcrafted rings, earrings, pendants, necklaces, bracelets and devotional jewellery. Shop Surat's finest fine jewellery, online.",
  keywords: [
    "Niryana Jewels",
    "fine jewellery Surat",
    "silver jewellery",
    "gold rings",
    "devotional pendant",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Niryana Jewels | Fine Jewellery with Heart & Heritage",
    description: "Handcrafted rings, earrings, pendants & devotional jewellery.",
    siteName: "Niryana Jewels",
    url: SITE_URL,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 1200, alt: "Niryana Jewels — Fine Jewellery" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Niryana Jewels | Fine Jewellery with Heart & Heritage",
    description: "Handcrafted rings, earrings, pendants & devotional jewellery.",
    images: [OG_IMAGE],
  },
  // Replace with the real verification code from Google Search Console once available.
  // verification: { google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-cream text-charcoal antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
