// =====================================================================================
// Transactional email sending (order invoices, back-in-stock alerts, abandoned-cart
// reminders, newsletter welcome, low-stock digest).
//
// IMPORTANT: Render's free web service plan blocks outbound traffic to SMTP ports
// (25/465/587) as of Sept 2025 (https://render.com/changelog/free-web-services-will-no-
// longer-allow-outbound-traffic-to-smtp-ports), so this backend can no longer talk to
// Gmail SMTP directly — every send here used to time out silently. Instead, every email
// below is built as HTML/text (+ optional base64 attachments) and POSTed to an internal
// relay endpoint on the Next.js app (app/api/internal/relay-email/route.js), which runs
// on Vercel (not subject to that block) and already has working NODEMAILER_EMAIL /
// NODEMAILER_PASS credentials (same ones used for the admin OTP emails there).
// Protected by INTERNAL_EMAIL_SECRET, which must match on both Vercel and Render.
// =====================================================================================
const { generateInvoicePdfBuffer } = require("./generateInvoicePdf");

const SITE_URL = (process.env.SITE_URL || "https://niryana-jewels-iota.vercel.app").replace(/\/$/, "");
const LOGO_URL = `${SITE_URL}/logo/niryana-logo-light.png`;

async function relayEmail({ to, subject, text, html, attachments }) {
  if (!process.env.INTERNAL_EMAIL_SECRET) {
    throw new Error("INTERNAL_EMAIL_SECRET not configured on this host");
  }
  const res = await fetch(`${SITE_URL}/api/internal/relay-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_EMAIL_SECRET,
    },
    body: JSON.stringify({ to, subject, text, html, attachments }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Email relay failed with status ${res.status}`);
  }
}

function wrapEmail({ eyebrow, title, bodyHtml, ctaUrl, ctaLabel, footerNote }) {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#EDE7DA; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDE7DA; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; background:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow: 0 4px 24px rgba(31,61,50,0.12);">

            <tr>
              <td align="center" style="background:#1F3D32; padding: 36px 24px 28px;">
                <img src="${LOGO_URL}" alt="Niryana Jewels" width="160" style="display:block; width:160px; max-width:70%; height:auto; margin: 0 auto;" />
              </td>
            </tr>

            <tr>
              <td style="height:3px; line-height:3px; font-size:0; background: linear-gradient(90deg, #1F3D32 0%, #C9A86A 50%, #1F3D32 100%);">&nbsp;</td>
            </tr>

            <tr>
              <td style="padding: 36px 36px 8px;">
                <p style="color:#C9A86A; letter-spacing: 3px; font-size: 11px; text-transform: uppercase; margin: 0 0 10px; text-align:center; font-family: Georgia, serif;">${eyebrow}</p>
                <h1 style="color:#1F3D32; font-size: 22px; margin: 0 0 14px; text-align:center; font-weight: normal;">${title}</h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 36px 8px;">${bodyHtml}</td>
            </tr>

            ${
              ctaUrl
                ? `
            <tr>
              <td align="center" style="padding: 12px 36px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius: 999px; background: #1F3D32;">
                      <a href="${ctaUrl}" target="_blank" style="display:inline-block; padding: 14px 36px; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color:#FAF7F0; text-decoration:none; font-family: Georgia, serif;">${ctaLabel}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
                : ""
            }

            <tr>
              <td style="padding: 0 36px 32px;">
                <p style="color:#8A8A7D; font-size: 12.5px; line-height: 1.6; margin: 0; text-align:center;">
                  ${footerNote || ""}
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#FAF7F0; padding: 20px 36px; border-top: 1px solid #ECE4D0;">
                <p style="color:#B3AA96; font-size: 11px; letter-spacing: 0.5px; margin: 0; text-align:center;">
                  Niryana Jewels &middot; Fine Jewellery with Heart &amp; Heritage<br/>
                  This is an automated message, please don't reply to this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

// ---------------------------------------------------------------------------
// Back-in-stock notification
// ---------------------------------------------------------------------------
async function sendBackInStockEmail(toEmail, product) {
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : null;

  await relayEmail({
    to: toEmail,
    subject: `Good news — "${product.name}" is back in stock!`,
    text: `"${product.name}" is back in stock at Niryana Jewels. Shop it now before it sells out again: ${productUrl}`,
    html: wrapEmail({
      eyebrow: "Back In Stock",
      title: `"${product.name}" is back!`,
      bodyHtml: `
        ${
          image
            ? `<div style="text-align:center; margin-bottom:20px;"><img src="${image}" alt="${product.name}" width="180" style="width:180px; max-width:60%; height:auto; border-radius:10px; display:inline-block;" /></div>`
            : ""
        }
        <p style="color:#5B5B52; font-size: 14px; line-height: 1.6; margin: 0 0 6px; text-align:center;">
          You asked us to let you know — <strong>${product.name}</strong> is available again.
        </p>
        <p style="color:#1F3D32; font-size: 18px; margin: 10px 0 0; text-align:center; font-weight: bold;">
          ₹${Number(product.price || 0).toLocaleString("en-IN")}
        </p>
      `,
      ctaUrl: productUrl,
      ctaLabel: "Shop Now",
      footerNote: "Popular pieces sell out quickly — grab yours before it's gone again.",
    }),
  });
}

// ---------------------------------------------------------------------------
// Abandoned cart reminder
// ---------------------------------------------------------------------------
async function sendAbandonedCartReminderEmail(toEmail, name, items, subtotal) {
  const cartUrl = `${SITE_URL}/cart`;
  const firstName = (name || "").split(" ")[0] || "there";

  const itemsHtml = (items || [])
    .slice(0, 5)
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #ECE4D0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${
                i.image
                  ? `<td width="48" style="padding-right:12px;"><img src="${i.image}" width="48" height="48" style="width:48px; height:48px; object-fit:cover; border-radius:8px; display:block;" /></td>`
                  : ""
              }
              <td style="color:#1F3D32; font-size:13px;">${i.name}${i.quantity > 1 ? ` &times; ${i.quantity}` : ""}</td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  await relayEmail({
    to: toEmail,
    subject: `You left something beautiful behind, ${firstName} ✨`,
    text: `Hi ${firstName}, you left items in your Niryana Jewels cart. Complete your order: ${cartUrl}`,
    html: wrapEmail({
      eyebrow: "Still Thinking It Over?",
      title: `Your cart is waiting, ${firstName}`,
      bodyHtml: `
        <p style="color:#5B5B52; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align:center;">
          You left these pieces in your cart. They're still here — complete your order before they sell out.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
          ${itemsHtml}
        </table>
        <p style="color:#1F3D32; font-size: 16px; margin: 16px 0 0; text-align:center; font-weight:bold;">
          Subtotal: ₹${Number(subtotal || 0).toLocaleString("en-IN")}
        </p>
      `,
      ctaUrl: cartUrl,
      ctaLabel: "Complete Your Order",
      footerNote: "If you already completed this order, you can safely ignore this email.",
    }),
  });
}

// ---------------------------------------------------------------------------
// Newsletter welcome email
// ---------------------------------------------------------------------------
async function sendNewsletterWelcomeEmail(toEmail) {
  await relayEmail({
    to: toEmail,
    subject: "Welcome to the Niryana circle ✨",
    text: `You're subscribed! You'll be the first to hear about new arrivals, festive collections & exclusive offers from Niryana Jewels. Shop now: ${SITE_URL}`,
    html: wrapEmail({
      eyebrow: "Welcome",
      title: "You're on the list!",
      bodyHtml: `
        <p style="color:#5B5B52; font-size: 14px; line-height: 1.6; margin: 0; text-align:center;">
          Thank you for joining the Niryana circle. You'll be the first to know about new arrivals,
          festive collections, and exclusive offers — straight to your inbox.
        </p>
      `,
      ctaUrl: SITE_URL,
      ctaLabel: "Shop The Collection",
      footerNote: "You can unsubscribe at any time by replying to a future email.",
    }),
  });
}

// ---------------------------------------------------------------------------
// Low-stock / out-of-stock admin digest — one email (at most once/day, see
// server.js cron handler) listing every product/size that has dropped below
// the configured threshold, so the shop owner can reorder/restock in time.
// ---------------------------------------------------------------------------
async function sendLowStockAlertEmail(toEmail, items, threshold) {
  const inventoryUrl = `${SITE_URL}/admin/inventory`;
  const outCount = items.filter((i) => i.stock === 0).length;
  const lowCount = items.length - outCount;

  const rowsHtml = items
    .slice(0, 25)
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #ECE4D0; color:#1F3D32; font-size:13px;">
          ${i.name}${i.variantLabel ? ` <span style="color:#8A8A7D;">(${i.variantLabel})</span>` : ""}
        </td>
        <td style="padding:8px 0; border-bottom:1px solid #ECE4D0; text-align:right; font-size:13px; font-weight:bold; color:${
          i.stock === 0 ? "#C0392B" : "#B8860B"
        };">
          ${i.stock === 0 ? "Out of stock" : `${i.stock} left`}
        </td>
      </tr>`
    )
    .join("");

  await relayEmail({
    to: toEmail,
    subject: `Stock alert: ${outCount} out of stock, ${lowCount} running low`,
    text: `${items.length} product(s) are at or below your low-stock threshold (${threshold} units). Review inventory: ${inventoryUrl}`,
    html: wrapEmail({
      eyebrow: "Inventory Alert",
      title: `${items.length} item${items.length === 1 ? "" : "s"} need attention`,
      bodyHtml: `
        <p style="color:#5B5B52; font-size: 14px; line-height: 1.6; margin: 0 0 16px; text-align:center;">
          These products are at or below your low-stock threshold of <strong>${threshold} units</strong>.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${rowsHtml}
        </table>
        ${
          items.length > 25
            ? `<p style="color:#8A8A7D; font-size:12px; margin-top:12px; text-align:center;">+ ${items.length - 25} more — see the full list in Admin → Inventory.</p>`
            : ""
        }
      `,
      ctaUrl: inventoryUrl,
      ctaLabel: "Open Inventory",
      footerNote: "You're receiving this because an alert email is configured in Admin → Settings. At most one of these is sent per day.",
    }),
  });
}

// ---------------------------------------------------------------------------
// Order invoice — sent automatically right when a new order is placed
// (see routes/orders.js POST /). Carries the real letterhead-branded invoice
// PDF as an attachment, so the customer gets their bill in their inbox
// without having to visit the site — it's also still viewable/downloadable
// any time from "My Orders" on the storefront and from the Admin order page.
// ---------------------------------------------------------------------------
async function sendOrderInvoiceEmail(order) {
  const firstName = (order.customerName || "").split(" ")[0] || "there";
  const pdfBuffer = await generateInvoicePdfBuffer(order);

  const itemsHtml = (order.items || [])
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #ECE4D0; color:#1F3D32; font-size:13px;">
          ${i.name}${i.size ? ` <span style="color:#8A8A7D;">(Size ${i.size})</span>` : ""} &times; ${i.quantity}
        </td>
        <td style="padding:8px 0; border-bottom:1px solid #ECE4D0; text-align:right; font-size:13px; color:#1F3D32;">
          ₹${Number((i.price || 0) * (i.quantity || 1)).toLocaleString("en-IN")}
        </td>
      </tr>`
    )
    .join("");

  await relayEmail({
    to: order.email,
    subject: `Your Niryana Jewels invoice — Order #${order.orderNumber}`,
    text: `Hi ${firstName}, thank you for your order #${order.orderNumber}! Your invoice is attached as a PDF. Order total: ₹${Number(order.total || 0).toLocaleString("en-IN")}.`,
    html: wrapEmail({
      eyebrow: "Order Confirmed",
      title: `Thank you, ${firstName}!`,
      bodyHtml: `
        <p style="color:#5B5B52; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align:center;">
          Your order <strong>#${order.orderNumber}</strong> has been placed successfully. Your official invoice
          is attached to this email as a PDF.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
          ${itemsHtml}
        </table>
        <p style="color:#1F3D32; font-size: 16px; margin: 16px 0 0; text-align:center; font-weight:bold;">
          Total Paid: ₹${Number(order.total || 0).toLocaleString("en-IN")}
        </p>
      `,
      ctaUrl: `${SITE_URL}/orders/${order.orderNumber}?contact=${encodeURIComponent(order.email || order.phone || "")}`,
      ctaLabel: "Track Your Order",
      footerNote: "Keep this email for your records — the attached PDF is your official tax invoice.",
    }),
    attachments: [
      {
        filename: `Invoice-${order.orderNumber}.pdf`,
        contentBase64: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  });
}

module.exports = {
  sendBackInStockEmail,
  sendAbandonedCartReminderEmail,
  sendNewsletterWelcomeEmail,
  sendLowStockAlertEmail,
  sendOrderInvoiceEmail,
};
