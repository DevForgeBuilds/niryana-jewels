// =====================================================================================
// Server-side (Node) version of the invoice generator: overlays an order's details onto
// the real Niryana Jewels letterhead (backend/assets/niryana-letterhead.pdf) using
// pdf-lib, and returns a Buffer so it can be emailed as an attachment right when an
// order is placed. Mirrors lib/generateInvoicePdf.js on the Next.js frontend (used for
// the on-demand "Download Invoice" buttons) — same layout, same field names — just
// reading the template from disk instead of fetching it, and returning bytes instead of
// triggering a browser download.
// =====================================================================================
const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const TEMPLATE_PATH = path.join(__dirname, "../assets/niryana-letterhead.pdf");

const MARGIN_LEFT = 56;
const MARGIN_RIGHT = 539;
const CONTENT_TOP = 668;
const CONTENT_BOTTOM = 92;

function money(n) {
  return `Rs ${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
}

function wrapText(text, font, size, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

async function generateInvoicePdfBuffer(order) {
  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];

  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const forest = rgb(31 / 255, 56 / 255, 43 / 255);
  const gold = rgb(177 / 255, 141 / 255, 76 / 255);
  const charcoal = rgb(0.25, 0.25, 0.25);
  const muted = rgb(0.5, 0.5, 0.5);
  const lineColor = rgb(0.85, 0.85, 0.82);

  let y = CONTENT_TOP;
  const draw = (text, x, size, font, color) => page.drawText(String(text ?? ""), { x, y, size, font, color });
  const rightAlign = (text, rightX, size, font, color) => {
    const w = font.widthOfTextAtSize(String(text ?? ""), size);
    page.drawText(String(text ?? ""), { x: rightX - w, y, size, font, color });
  };
  const hr = (yy) =>
    page.drawLine({
      start: { x: MARGIN_LEFT, y: yy },
      end: { x: MARGIN_RIGHT, y: yy },
      thickness: 0.75,
      color: lineColor,
    });

  draw("TAX INVOICE", MARGIN_LEFT, 18, serifBold, forest);
  rightAlign(`Invoice #${order.orderNumber}`, MARGIN_RIGHT, 11, serifBold, forest);
  y -= 16;
  rightAlign(`Date: ${order.createdAt}`, MARGIN_RIGHT, 9.5, serif, muted);
  y -= 13;
  rightAlign(`Status: ${String(order.status || "").toUpperCase()}`, MARGIN_RIGHT, 9.5, serif, muted);
  y -= 16;
  hr(y);
  y -= 22;

  draw("BILLED TO", MARGIN_LEFT, 8.5, serifBold, gold);
  rightAlign("PAYMENT METHOD", MARGIN_RIGHT, 8.5, serifBold, gold);
  y -= 14;
  draw(order.customerName || "", MARGIN_LEFT, 11, serifBold, charcoal);
  rightAlign(order.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid (Razorpay)", MARGIN_RIGHT, 11, serif, charcoal);
  y -= 14;
  draw(order.phone || "", MARGIN_LEFT, 9.5, serif, charcoal);
  y -= 13;
  if (order.email) {
    draw(order.email, MARGIN_LEFT, 9.5, serif, charcoal);
    y -= 13;
  }
  const addrLines = wrapText(order.address || "", serif, 9.5, 260);
  for (const line of addrLines) {
    draw(line, MARGIN_LEFT, 9.5, serif, charcoal);
    y -= 13;
  }
  y -= 10;
  hr(y);
  y -= 20;

  const colQty = 380;
  const colPrice = 440;
  const colAmount = MARGIN_RIGHT;

  draw("ITEM", MARGIN_LEFT, 8.5, serifBold, gold);
  draw("QTY", colQty, 8.5, serifBold, gold);
  rightAlign("PRICE", colPrice, 8.5, serifBold, gold);
  rightAlign("AMOUNT", colAmount, 8.5, serifBold, gold);
  y -= 12;
  hr(y);
  y -= 16;

  const items = Array.isArray(order.items) ? order.items : [];
  const availableForItems = y - (CONTENT_BOTTOM + 150);
  const rowHeight = Math.max(12, Math.min(18, availableForItems / Math.max(items.length, 1)));

  for (const it of items) {
    const name = it.size ? `${it.name} (Size ${it.size})` : it.name;
    const nameLines = wrapText(name, serif, 9.5, 300);
    draw(nameLines[0], MARGIN_LEFT, 9.5, serif, charcoal);
    draw(String(it.quantity), colQty, 9.5, serif, charcoal);
    rightAlign(money(it.price), colPrice, 9.5, serif, charcoal);
    rightAlign(money(it.price * it.quantity), colAmount, 9.5, serif, charcoal);
    y -= rowHeight;
    for (let i = 1; i < nameLines.length; i++) {
      draw(nameLines[i], MARGIN_LEFT, 9.5, serif, charcoal);
      y -= rowHeight;
    }
  }

  y -= 4;
  hr(y);
  y -= 20;

  const totalsLabelX = 400;
  const row = (label, value, opts = {}) => {
    draw(label, totalsLabelX, opts.size || 9.5, opts.font || serif, opts.color || charcoal);
    rightAlign(value, colAmount, opts.size || 9.5, opts.font || serif, opts.color || charcoal);
    y -= opts.gap || 15;
  };

  row("Subtotal", money(order.subtotal));
  if (order.discount > 0) {
    row(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `- ${money(order.discount)}`, { color: gold });
  }
  row("GST", money(order.gst));
  if (order.codFee > 0) row("COD Fee", money(order.codFee));
  hr(y + 6);
  row("TOTAL", money(order.total), { font: serifBold, size: 12.5, color: forest, gap: 18 });

  draw(
    "This is a computer-generated invoice and does not require a physical signature.",
    MARGIN_LEFT,
    8,
    serif,
    muted
  );
  y -= 12;
  draw("Thank you for shopping with Niryana Jewels — Fine Jewellery with Heart & Heritage.", MARGIN_LEFT, 8, serif, muted);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

module.exports = { generateInvoicePdfBuffer };
