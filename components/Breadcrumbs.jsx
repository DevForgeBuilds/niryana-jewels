import Link from "next/link";

// Reusable breadcrumb trail for Shop / Collections / Product pages. Emits a
// BreadcrumbList JSON-LD block alongside the visible trail so search engines
// can show the breadcrumb path in results too.
//
// items: [{ label: "Shop", href: "/shop" }, { label: "Rings" }]  (last item
// has no href — it's the current page)
export default function Breadcrumbs({ items = [], siteUrl = "https://niryana-jewels-iota.vercel.app" }) {
  if (!items.length) return null;

  const trail = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-charcoal/50">
        <ol className="flex flex-wrap items-center gap-1.5">
          {trail.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-charcoal/30">/</span>}
              {item.href ? (
                <Link href={item.href} className="capitalize hover:text-gold transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="capitalize text-forest font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
