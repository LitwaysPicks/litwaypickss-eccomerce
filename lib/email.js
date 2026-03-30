import nodemailer from "nodemailer";

const ADMIN_EMAIL = "litwaypicks@gmail.com";

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_APP_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function buildItemsTable(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
          ${item.name || item.title || "Item"}
          ${item.variant ? `<span style="color:#888;font-size:12px;"> (${item.variant})</span>` : ""}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity ?? 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}</td>
      </tr>`
    )
    .join("");
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead>
        <tr style="background:#f7f7f7;">
          <th style="padding:8px 12px;text-align:left;font-weight:600;color:#555;">Item</th>
          <th style="padding:8px 12px;text-align:center;font-weight:600;color:#555;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-weight:600;color:#555;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function baseLayout(content) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Litway Picks</span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f7f7f7;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#888;">© ${new Date().getFullYear()} Litway Picks · <a href="mailto:${ADMIN_EMAIL}" style="color:#888;">${ADMIN_EMAIL}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function buildOrderPlacedEmail(order, isAdmin = false) {
  const name = `${order.customer_first_name} ${order.customer_last_name}`.trim();
  const subject = isAdmin
    ? `New Order Received — ${order.external_id}`
    : `Order Confirmed — ${order.external_id}`;

  const greeting = isAdmin
    ? `<p style="margin:0 0 16px;font-size:15px;color:#333;">A new order has been placed by <strong>${name}</strong> (${order.customer_email}).</p>`
    : `<p style="margin:0 0 16px;font-size:15px;color:#333;">Hi ${order.customer_first_name}, thanks for your order! We've received your payment and will begin processing it shortly.</p>`;

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111;">Order Confirmed ✓</h2>
    ${greeting}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
      <tr>
        <td style="padding:6px 0;color:#555;width:140px;">Order Reference</td>
        <td style="padding:6px 0;color:#111;font-family:monospace;">${order.external_id}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Phone</td>
        <td style="padding:6px 0;color:#111;">${order.customer_phone}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Delivery Address</td>
        <td style="padding:6px 0;color:#111;">${[order.delivery_address, order.delivery_city, order.delivery_state].filter(Boolean).join(", ")}</td>
      </tr>
    </table>
    <h3 style="margin:16px 0 4px;font-size:14px;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Items</h3>
    ${buildItemsTable(order.items)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;font-size:14px;">
      ${order.discount > 0 ? `<tr><td style="padding:4px 12px;color:#555;">Subtotal</td><td style="padding:4px 12px;text-align:right;">${formatCurrency(order.subtotal)}</td></tr><tr><td style="padding:4px 12px;color:#22c55e;">Discount</td><td style="padding:4px 12px;text-align:right;color:#22c55e;">−${formatCurrency(order.discount)}</td></tr>` : ""}
      <tr><td style="padding:8px 12px;font-weight:700;font-size:15px;color:#111;">Total Paid</td><td style="padding:8px 12px;text-align:right;font-weight:700;font-size:15px;color:#111;">${formatCurrency(order.final_total)}</td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:13px;color:#888;">Payment method: MoMo · Transaction ID: ${order.financial_transaction_id || "Pending"}</p>
  `);

  return { subject, html };
}

export function buildOrderCompletedEmail(order, isAdmin = false) {
  const name = `${order.customer_first_name} ${order.customer_last_name}`.trim();
  const subject = isAdmin
    ? `Order Completed — ${order.external_id}`
    : `Your Order Has Been Delivered — ${order.external_id}`;

  const greeting = isAdmin
    ? `<p style="margin:0 0 16px;font-size:15px;color:#333;">Order <strong>${order.external_id}</strong> for <strong>${name}</strong> has been marked as completed.</p>`
    : `<p style="margin:0 0 16px;font-size:15px;color:#333;">Hi ${order.customer_first_name}, great news! Your order has been delivered. We hope you love your purchase!</p>`;

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111;">Order Completed 🎉</h2>
    ${greeting}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
      <tr>
        <td style="padding:6px 0;color:#555;width:140px;">Order Reference</td>
        <td style="padding:6px 0;color:#111;font-family:monospace;">${order.external_id}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Total</td>
        <td style="padding:6px 0;color:#111;font-weight:600;">${formatCurrency(order.final_total)}</td>
      </tr>
    </table>
    ${buildItemsTable(order.items)}
    <p style="margin:16px 0 0;font-size:13px;color:#888;">Thank you for shopping with Litway Picks!</p>
  `);

  return { subject, html };
}

export function buildOrderRefundedEmail(order, isAdmin = false) {
  const name = `${order.customer_first_name} ${order.customer_last_name}`.trim();
  const subject = isAdmin
    ? `Order Refunded — ${order.external_id}`
    : `Your Refund Has Been Processed — ${order.external_id}`;

  const greeting = isAdmin
    ? `<p style="margin:0 0 16px;font-size:15px;color:#333;">Order <strong>${order.external_id}</strong> for <strong>${name}</strong> has been marked as refunded.</p>`
    : `<p style="margin:0 0 16px;font-size:15px;color:#333;">Hi ${order.customer_first_name}, your refund for order <strong>${order.external_id}</strong> has been processed. The amount of <strong>${formatCurrency(order.final_total)}</strong> will be returned to your original payment method.</p>`;

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111;">Refund Processed</h2>
    ${greeting}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
      <tr>
        <td style="padding:6px 0;color:#555;width:140px;">Order Reference</td>
        <td style="padding:6px 0;color:#111;font-family:monospace;">${order.external_id}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Refund Amount</td>
        <td style="padding:6px 0;color:#111;font-weight:600;">${formatCurrency(order.final_total)}</td>
      </tr>
    </table>
    ${buildItemsTable(order.items)}
    <p style="margin:16px 0 0;font-size:13px;color:#888;">Questions? Reply to this email or contact us at ${ADMIN_EMAIL}.</p>
  `);

  return { subject, html };
}

export function buildOrderFailedEmail(order, isAdmin = false) {
  const name = `${order.customer_first_name} ${order.customer_last_name}`.trim();
  const subject = isAdmin
    ? `Payment Failed — ${order.external_id}`
    : `Payment Failed — ${order.external_id}`;

  const greeting = isAdmin
    ? `<p style="margin:0 0 16px;font-size:15px;color:#333;">Payment for order <strong>${order.external_id}</strong> by <strong>${name}</strong> (${order.customer_email}) has failed.</p>`
    : `<p style="margin:0 0 16px;font-size:15px;color:#333;">Hi ${order.customer_first_name}, unfortunately your payment for order <strong>${order.external_id}</strong> could not be processed. No funds have been deducted.</p>`;

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111;">Payment Failed ✗</h2>
    ${greeting}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
      <tr>
        <td style="padding:6px 0;color:#555;width:140px;">Order Reference</td>
        <td style="padding:6px 0;color:#111;font-family:monospace;">${order.external_id}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Amount</td>
        <td style="padding:6px 0;color:#111;font-weight:600;">${formatCurrency(order.final_total)}</td>
      </tr>
      ${order.failure_reason ? `<tr><td style="padding:6px 0;color:#555;">Reason</td><td style="padding:6px 0;color:#dc2626;">${order.failure_reason}</td></tr>` : ""}
    </table>
    ${buildItemsTable(order.items)}
    <p style="margin:16px 0 0;font-size:14px;color:#333;">${isAdmin ? "The customer may retry payment from their account." : 'You can retry your order from your <a href="https://litwaypicks.com/account?tab=orders" style="color:#3b82f6;">account page</a>.'}</p>
    <p style="margin:8px 0 0;font-size:13px;color:#888;">Questions? Contact us at ${ADMIN_EMAIL}.</p>
  `);

  return { subject, html };
}

export async function sendOrderFailedEmails(order) {
  const customer = buildOrderFailedEmail(order, false);
  const admin = buildOrderFailedEmail(order, true);

  await Promise.allSettled([
    sendMail({ to: order.customer_email, ...customer }),
    sendMail({ to: ADMIN_EMAIL, ...admin }),
  ]);
}

export async function sendAdminNewReviewNotification({ productName, productId, reviewerName, rating, comment }) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111;">New Product Review</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#333;">A customer has left a new review on <strong>${productName}</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
      <tr>
        <td style="padding:6px 0;color:#555;width:120px;">Product</td>
        <td style="padding:6px 0;color:#111;">${productName}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Reviewer</td>
        <td style="padding:6px 0;color:#111;">${reviewerName}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Rating</td>
        <td style="padding:6px 0;color:#f59e0b;font-size:18px;">${stars} <span style="color:#111;font-size:14px;">(${rating}/5)</span></td>
      </tr>
      ${comment ? `<tr><td style="padding:6px 0;color:#555;vertical-align:top;">Comment</td><td style="padding:6px 0;color:#333;">${comment}</td></tr>` : ""}
    </table>
  `);

  await sendMail({
    to: ADMIN_EMAIL,
    subject: `New Review — ${productName} (${rating}/5 ★)`,
    html,
  }).catch((err) => console.error("Admin review notification error:", err.message));
}

// ─── Send helpers ─────────────────────────────────────────────────────────────

async function sendMail({ to, subject, html }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Litway Picks" <${process.env.GMAIL_APP_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendOrderPlacedEmails(order) {
  const customer = buildOrderPlacedEmail(order, false);
  const admin = buildOrderPlacedEmail(order, true);

  await Promise.allSettled([
    sendMail({ to: order.customer_email, ...customer }),
    sendMail({ to: ADMIN_EMAIL, ...admin }),
  ]);
}

export async function sendOrderCompletedEmails(order) {
  const customer = buildOrderCompletedEmail(order, false);
  const admin = buildOrderCompletedEmail(order, true);

  await Promise.allSettled([
    sendMail({ to: order.customer_email, ...customer }),
    sendMail({ to: ADMIN_EMAIL, ...admin }),
  ]);
}

export async function sendOrderRefundedEmails(order) {
  const customer = buildOrderRefundedEmail(order, false);
  const admin = buildOrderRefundedEmail(order, true);

  await Promise.allSettled([
    sendMail({ to: order.customer_email, ...customer }),
    sendMail({ to: ADMIN_EMAIL, ...admin }),
  ]);
}

// ─── Contact form ─────────────────────────────────────────────────────────────

const SUBJECT_LABELS = {
  "order-inquiry": "Order Inquiry",
  "product-question": "Product Question",
  "delivery-issue": "Delivery Issue",
  "return-exchange": "Return / Exchange",
  "technical-support": "Technical Support",
  partnership: "Partnership Inquiry",
  other: "Other",
};

export async function sendContactEmails({ name, email, subject, message }) {
  const subjectLabel = SUBJECT_LABELS[subject] ?? subject;

  // Email to admin
  const adminHtml = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111;">New Contact Message</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#333;">
      You have received a new message from the contact form.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px;">
      <tr>
        <td style="padding:6px 0;color:#555;width:100px;">Name</td>
        <td style="padding:6px 0;color:#111;font-weight:600;">${name}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Email</td>
        <td style="padding:6px 0;color:#111;">
          <a href="mailto:${email}" style="color:#3b82f6;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;">Subject</td>
        <td style="padding:6px 0;color:#111;">${subjectLabel}</td>
      </tr>
    </table>
    <h3 style="margin:0 0 8px;font-size:14px;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Message</h3>
    <div style="background:#f7f7f7;border-radius:8px;padding:16px;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;">${message}</div>
    <p style="margin:20px 0 0;font-size:13px;color:#888;">
      Reply directly to <a href="mailto:${email}" style="color:#3b82f6;">${email}</a> to respond.
    </p>
  `);

  // Confirmation email to sender
  const senderHtml = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111;">Thanks for reaching out!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#333;">
      Hi ${name}, we received your message and will get back to you within 24 hours.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px;">
      <tr>
        <td style="padding:6px 0;color:#555;width:100px;">Subject</td>
        <td style="padding:6px 0;color:#111;">${subjectLabel}</td>
      </tr>
    </table>
    <h3 style="margin:0 0 8px;font-size:14px;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Your Message</h3>
    <div style="background:#f7f7f7;border-radius:8px;padding:16px;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;">${message}</div>
    <p style="margin:20px 0 0;font-size:13px;color:#888;">
      Need urgent help? WhatsApp us at +231-888-464-940 — available 24/7.
    </p>
  `);

  await Promise.allSettled([
    sendMail({
      to: ADMIN_EMAIL,
      subject: `[Contact] ${subjectLabel} — ${name}`,
      html: adminHtml,
    }),
    sendMail({
      to: email,
      subject: `We received your message — Litway Picks`,
      html: senderHtml,
    }),
  ]);
}
