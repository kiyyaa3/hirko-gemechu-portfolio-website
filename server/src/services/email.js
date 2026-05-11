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
    NOTIFY_EMAIL,
    RESEND_API_KEY
  } = process.env;

  if (RESEND_API_KEY && NOTIFY_EMAIL) {
    return sendResendNotification(contactMessage, {
      apiKey: RESEND_API_KEY,
      notifyEmail: NOTIFY_EMAIL,
      from: SMTP_FROM || "Portfolio Contact <onboarding@resend.dev>"
    });
  }

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
    console.log("Email notification skipped: SMTP settings are not configured.");
    return {
      sent: false,
      skipped: true,
      error: "Email notification settings are missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and NOTIFY_EMAIL in Render."
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
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

  try {
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: NOTIFY_EMAIL,
      replyTo: contactMessage.email,
      subject: `New portfolio message: ${contactMessage.subject}`,
      text: plainText,
      html
    });

    return { sent: true, provider: "smtp" };
  } catch (error) {
    throw error;
  }
}

export async function sendChatNotification(chatMessage) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    NOTIFY_EMAIL,
    RESEND_API_KEY
  } = process.env;

  const subject = "New chatbot lead from Hirko Gemechu portfolio";
  const text = [
    "A visitor started a chatbot conversation.",
    "",
    `Session: ${chatMessage.sessionId}`,
    `Question: ${chatMessage.question}`,
    `Reply source: ${chatMessage.source}`,
    "",
    `Assistant reply: ${chatMessage.answer}`,
    "",
    `Received: ${new Date(chatMessage.createdAt || Date.now()).toLocaleString()}`
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#14213d;max-width:640px">
      <h2 style="margin:0 0 12px;color:#0f766e">New chatbot lead</h2>
      <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
        <tr><td style="padding:8px;border:1px solid #dce6ed;font-weight:bold">Session</td><td style="padding:8px;border:1px solid #dce6ed">${escapeHtml(chatMessage.sessionId)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #dce6ed;font-weight:bold">Source</td><td style="padding:8px;border:1px solid #dce6ed">${escapeHtml(chatMessage.source)}</td></tr>
      </table>
      <h3 style="margin:0 0 8px;color:#14213d">Visitor question</h3>
      <div style="padding:14px;background:#f4f8fb;border:1px solid #dce6ed;border-radius:8px;margin-bottom:14px">
        ${escapeHtml(chatMessage.question).replace(/\n/g, "<br>")}
      </div>
      <h3 style="margin:0 0 8px;color:#14213d">Assistant reply</h3>
      <div style="padding:14px;background:#f4f8fb;border:1px solid #dce6ed;border-radius:8px">
        ${escapeHtml(chatMessage.answer).replace(/\n/g, "<br>")}
      </div>
      <p style="color:#5d6b7a;font-size:13px">Open the admin dashboard to review saved chatbot conversations.</p>
    </div>
  `;

  if (RESEND_API_KEY && NOTIFY_EMAIL) {
    return sendResendEmail({
      apiKey: RESEND_API_KEY,
      from: SMTP_FROM || "Portfolio Chat <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject,
      text,
      html
    });
  }

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
    console.log("Chat notification skipped: email settings are not configured.");
    return {
      sent: false,
      skipped: true,
      error: "Email notification settings are missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and NOTIFY_EMAIL in Render."
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: NOTIFY_EMAIL,
    subject,
    text,
    html
  });

  return { sent: true, provider: "smtp" };
}

async function sendResendNotification(contactMessage, { apiKey, notifyEmail, from }) {
  return sendResendEmail({
    apiKey,
    from,
    to: notifyEmail,
    replyTo: contactMessage.email,
    subject: `New portfolio message: ${contactMessage.subject}`,
    text: [
      `Name: ${contactMessage.name}`,
      `Email: ${contactMessage.email}`,
      `Phone: ${contactMessage.phone || "Not provided"}`,
      "",
      contactMessage.message
    ].join("\n"),
    html: `
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
    `
  });
}

async function sendResendEmail({ apiKey, from, to, replyTo, subject, text, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
      html
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Resend email failed with status ${response.status}.`);
  }

  return { sent: true, provider: "resend", id: data?.id };
}
