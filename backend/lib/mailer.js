// =====================================================================================
// Transactional email sending (back-in-stock alerts, abandoned-cart reminders) via
// Gmail/nodemailer — same approach as the frontend's lib/mailer.js (OTP/reset emails),
// but living on the Express backend since that's where cart + stock state is tracked.
// Requires NODEMAILER_EMAIL / NODEMAILER_PASS env vars on the backend host (Render).
// =====================================================================================
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASS) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  return transporter;
}

const SITE_URL = (process.env.SITE_URL || "https://niryana-jewels-iota.vercel.app").replace(/\/$/, "");
const LOGO_URL = `${SITE_URL}/logo/niryana-logo-light.png`;

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
  const t = getTransporter();
  if (!t) {
    // Throw (rather than silently return) so the caller does NOT mark this
    // subscriber as "notified" — if NODEMAILER_EMAIL/PASS get misconfigured,
    // we want the next restock/cron pass to retry instead of losing it forever.
    throw new Error("NODEMAILER_EMAIL/NODEMAILER_PASS not configured on this host");
  }
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : null;

  await t.sendMail({
    from: `"Niryana Jewels" <${process.env.NODEMAILER_EMAIL}>`,
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
  const t = getTransporter();
  if (!t) {
    throw new Error("NODEMAILER_EMAIL/NODEMAILER_PASS not configured on this host");
  }
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

  await t.sendMail({
    from: `"Niryana Jewels" <${process.env.NODEMAILER_EMAIL}>`,
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
  const t = getTransporter();
  if (!t) {
    throw new Error("NODEMAILER_EMAIL/NODEMAILER_PASS not configured on this host");
  }

  await t.sendMail({
    from: `"Niryana Jewels" <${process.env.NODEMAILER_EMAIL}>`,
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

module.exports = { sendBackInStockEmail, sendAbandonedCartReminderEmail, sendNewsletterWelcomeEmail };
