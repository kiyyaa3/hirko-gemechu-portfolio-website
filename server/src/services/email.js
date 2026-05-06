import nodemailer from "nodemailer";

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

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: NOTIFY_EMAIL,
    replyTo: contactMessage.email,
    subject: `New portfolio message: ${contactMessage.subject}`,
    text: [
      `Name: ${contactMessage.name}`,
      `Email: ${contactMessage.email}`,
      `Phone: ${contactMessage.phone || "Not provided"}`,
      "",
      contactMessage.message
    ].join("\n")
  });

  return { sent: true };
}
