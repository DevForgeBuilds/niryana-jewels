// Mock data for the newer Admin Dashboard sections (Reviews, Returns, Staff).
// Replace with real MySQL-backed tables (`reviews`, `returns`, `staff_users`) later.

export const MOCK_REVIEWS = [
  {
    id: 1,
    productName: "9KT Gold Heart Ring",
    customerName: "Priya Shah",
    rating: 5,
    comment: "Absolutely gorgeous! Exactly like the photos, very comfortable to wear daily.",
    status: "approved",
    createdAt: "2026-09-14",
  },
  {
    id: 2,
    productName: "Shree Ram Devotional Pendant",
    customerName: "Ankit Mehta",
    rating: 5,
    comment: "Beautiful craftsmanship, feels very premium for the price.",
    status: "approved",
    createdAt: "2026-09-21",
  },
  {
    id: 3,
    productName: "Diamond Drape Necklace",
    customerName: "Riya Patel",
    rating: 4,
    comment: "Stunning piece, though delivery took a couple of days longer than expected.",
    status: "pending",
    createdAt: "2026-09-26",
  },
  {
    id: 4,
    productName: "Raksha Bandhan Rakhi Bracelet",
    customerName: "Anonymous",
    rating: 2,
    comment: "This looks nothing like the picture, very disappointed.",
    status: "pending",
    createdAt: "2026-09-27",
  },
];

export const MOCK_RETURNS = [
  {
    id: 1,
    orderNumber: "NJ-2026-000101",
    customerName: "Priya Shah",
    productName: "9KT Gold Heart Ring",
    reason: "Size too small",
    amount: 18500,
    status: "requested",
    createdAt: "2026-09-29",
  },
  {
    id: 2,
    orderNumber: "NJ-2026-000102",
    customerName: "Ankit Mehta",
    productName: "Shree Ram Devotional Pendant",
    reason: "Changed my mind",
    amount: 4999,
    status: "approved",
    createdAt: "2026-09-24",
  },
  {
    id: 3,
    orderNumber: "NJ-2026-000104",
    customerName: "Karan Desai",
    productName: "Raksha Bandhan Rakhi Bracelet",
    reason: "Defective clasp",
    amount: 2499,
    status: "refunded",
    createdAt: "2026-09-20",
  },
];

export const MOCK_STAFF = [
  { id: 1, name: "Vraj Panadya", email: "vraj@niryanajewels.com", role: "Owner / Admin", active: true },
  { id: 2, name: "Store Manager", email: "manager@niryanajewels.com", role: "Manager", active: true },
];
