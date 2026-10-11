"use client";

import Link from "next/link";

// Small, consistent pill-style icon buttons for admin table "Actions"
// columns, replacing the old bare underlined text links across the admin
// panel (Products, Categories, Collections, Coupons, Reviews, Staff).

const base =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

const variants = {
  edit: "border-gold/40 text-gold hover:bg-gold hover:text-forest",
  neutral: "border-charcoal/20 text-charcoal/60 hover:bg-charcoal/5",
  positive: "border-green-300 text-green-600 hover:bg-green-600 hover:text-white",
  warning: "border-yellow-300 text-yellow-700 hover:bg-yellow-500 hover:text-white",
  danger: "border-red-200 text-red-500 hover:bg-red-500 hover:text-white",
  primary: "border-forest text-forest hover:bg-forest hover:text-cream",
};

const icons = {
  edit: (
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  delete: (
    <path
      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  check: <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />,
  x: <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />,
  save: <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />,
};

function Icon({ name }) {
  if (!name || !icons[name]) return null;
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      {icons[name]}
    </svg>
  );
}

export function ActionButton({ href, onClick, variant = "neutral", icon, children, disabled, type = "button" }) {
  const className = `${base} ${variants[variant] || variants.neutral}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        <Icon name={icon} />
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      <Icon name={icon} />
      {children}
    </button>
  );
}

export function EditAction({ href, onClick, label = "Edit" }) {
  return (
    <ActionButton href={href} onClick={onClick} variant="edit" icon="edit">
      {label}
    </ActionButton>
  );
}

export function DeleteAction({ onClick, label = "Delete", disabled }) {
  return (
    <ActionButton onClick={onClick} variant="danger" icon="delete" disabled={disabled}>
      {label}
    </ActionButton>
  );
}
