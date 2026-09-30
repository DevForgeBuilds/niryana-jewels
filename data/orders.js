// Mock order data for the Admin Dashboard demo.
// In production this comes from MySQL `orders` + `order_items` tables via /api/admin/orders.
export const MOCK_ORDERS = [
  {
    id: 1,
    orderNumber: "NJ-2026-000101",
    customerName: "Priya Shah",
    phone: "+91 98250 11223",
    email: "priya.shah@example.com",
    items: [
      { name: "9KT Gold Heart Ring", quantity: 1, price: 18500 },
    ],
    subtotal: 18500,
    gst: 555,
    total: 19055,
    status: "delivered",
    createdAt: "2026-09-12",
  },
  {
    id: 2,
    orderNumber: "NJ-2026-000102",
    customerName: "Ankit Mehta",
    phone: "+91 90999 44556",
    email: "ankit.mehta@example.com",
    items: [
      { name: "Shree Ram Devotional Pendant", quantity: 2, price: 4999 },
    ],
    subtotal: 9998,
    gst: 300,
    total: 10298,
    status: "shipped",
    createdAt: "2026-09-20",
  },
  {
    id: 3,
    orderNumber: "NJ-2026-000103",
    customerName: "Riya Patel",
    phone: "+91 99130 77889",
    email: "riya.patel@example.com",
    items: [
      { name: "Diamond Drape Necklace", quantity: 1, price: 45999 },
      { name: "Rose Bloom Stud Earrings", quantity: 1, price: 6999 },
    ],
    subtotal: 52998,
    gst: 1590,
    total: 54588,
    status: "processing",
    createdAt: "2026-09-25",
  },
  {
    id: 4,
    orderNumber: "NJ-2026-000104",
    customerName: "Karan Desai",
    phone: "+91 98980 12345",
    email: "karan.desai@example.com",
    items: [
      { name: "Raksha Bandhan Rakhi Bracelet", quantity: 3, price: 2499 },
    ],
    subtotal: 7497,
    gst: 225,
    total: 7722,
    status: "pending",
    createdAt: "2026-09-28",
  },
];

export const MOCK_CUSTOMERS = [
  { id: 1, name: "Priya Shah", email: "priya.shah@example.com", phone: "+91 98250 11223", orders: 1, totalSpent: 19055 },
  { id: 2, name: "Ankit Mehta", email: "ankit.mehta@example.com", phone: "+91 90999 44556", orders: 1, totalSpent: 10298 },
  { id: 3, name: "Riya Patel", email: "riya.patel@example.com", phone: "+91 99130 77889", orders: 1, totalSpent: 54588 },
  { id: 4, name: "Karan Desai", email: "karan.desai@example.com", phone: "+91 98980 12345", orders: 1, totalSpent: 7722 },
];
