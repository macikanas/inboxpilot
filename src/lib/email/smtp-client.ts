import nodemailer from "nodemailer";
import { decrypt } from "../crypto";
import { saveToSent, type EmailAccountConfig } from "./imap-client";

interface SendOptions {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  inReplyTo?: string;
}

export async function sendEmail(account: EmailAccountConfig & { smtpHost: string | null; smtpPort: number | null; email: string }, opts: SendOptions) {
  if (!account.smtpHost || !account.encryptedUsername || !account.encryptedPassword) {
    throw new Error("SMTP credentials not configured");
  }

  const user = decrypt(account.encryptedUsername);
  const pass = decrypt(account.encryptedPassword);

  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort || 465,
    secure: true,
    auth: { user, pass },
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: account.email,
    to: opts.to,
    subject: opts.subject,
    text: opts.body,
  };
  if (opts.cc) mailOptions.cc = opts.cc;
  if (opts.bcc) mailOptions.bcc = opts.bcc;
  if (opts.inReplyTo) {
    mailOptions.inReplyTo = opts.inReplyTo;
    mailOptions.references = opts.inReplyTo;
  }

  const info = await transporter.sendMail(mailOptions);

  // Save to Sent folder
  try {
    const rawMessage = [
      `From: ${account.email}`,
      `To: ${opts.to}`,
      opts.cc ? `Cc: ${opts.cc}` : null,
      `Subject: ${opts.subject}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: ${info.messageId}`,
      opts.inReplyTo ? `In-Reply-To: ${opts.inReplyTo}` : null,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      opts.body,
    ].filter(Boolean).join("\r\n");
    await saveToSent(account, rawMessage);
  } catch {
    // Don't fail send if saving to Sent fails
  }

  return { messageId: info.messageId, to: opts.to, subject: opts.subject };
}
