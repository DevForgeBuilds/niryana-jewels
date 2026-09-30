import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Niryana Jewels | Fine Jewellery with Heart & Heritage",
  description:
    "Niryana Jewels — handcrafted rings, earrings, pendants, necklaces, bracelets and devotional jewellery. Shop Surat's finest fine jewellery, online.",
  keywords: [
    "Niryana Jewels",
    "fine jewellery Surat",
    "silver jewellery",
    "gold rings",
    "devotional pendant",
  ],
  openGraph: {
    title: "Niryana Jewels | Fine Jewellery with Heart & Heritage",
    description: "Handcrafted rings, earrings, pendants & devotional jewellery.",
    siteName: "Niryana Jewels",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-cream text-charcoal antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
