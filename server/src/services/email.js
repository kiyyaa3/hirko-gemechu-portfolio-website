import nodemailer from "nodemailer";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactNotification(contactMessage) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    NOTIFY_EMAIL
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
    console.log("Email notification skipped: SMTP settings are not configured.");
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const plainText = [
    "New message from Hirko Gemechu portfolio",
    "",
    `Name: ${contactMessage.name}`,
    `Email: ${contactMessage.email}`,
    `Phone: ${contactMessage.phone || "Not provided"}`,
    `Subject: ${contactMessage.subject}`,
    "",
    contactMessage.message,
    "",
    `Received: ${new Date(contactMessage.createdAt || Date.now()).toLocaleString()}`
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#14213d;max-width:640px">
      <h2 style="margin:0 0 12px;color:#0f766e">New portfolio message</h2>
      <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
        <tr><td style="padding:8px;border:1px solid #dce6ed;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #dce6ed">${escapeHtml(contactMessage.name)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #dce6ed;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #dce6ed">${escapeHtml(contactMessage.email)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #dce6ed;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #dce6ed">${escapeHtml(contactMessage.phone || "Not provided")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #dce6ed;font-weight:bold">Subject</td><td style="padding:8px;border:1px solid #dce6ed">${escapeHtml(contactMessage.subject)}</td></tr>
      </table>
      <div style="padding:14px;background:#f4f8fb;border:1px solid #dce6ed;border-radius:8px">
        ${escapeHtml(contactMessage.message).replace(/\n/g, "<br>")}
      </div>
      <p style="color:#5d6b7a;font-size:13px">Reply directly to this email to contact the sender.</p>
    </div>
  `;

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: NOTIFY_EMAIL,
    replyTo: contactMessage.email,
    subject: `New portfolio message: ${contactMessage.subject}`,
    text: plainText,
    html
  });

  return { sent: true };
}
