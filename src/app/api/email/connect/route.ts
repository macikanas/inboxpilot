import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { testConnection, type EmailAccountConfig } from "@/lib/email/imap-client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { email, imapHost, imapPort, smtpHost, smtpPort, username, password, sentFolderName } = body;

  if (!email || !imapHost || !username || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Test IMAP connection
  const testConfig: EmailAccountConfig = {
    provider: "imap",
    imapHost,
    imapPort: imapPort || 993,
    encryptedUsername: encrypt(username),
    encryptedPassword: encrypt(password),
    sentFolderName: sentFolderName || "Sent Messages",
  };

  try {
    await testConnection(testConfig);
  } catch (err: any) {
    return NextResponse.json({ error: `Connection failed: ${err.message}` }, { status: 400 });
  }

  // Save account with encrypted credentials
  const account = await db.emailAccount.upsert({
    where: { userId_email: { userId: user.id, email } },
    create: {
      userId: user.id,
      email,
      provider: "imap",
      displayName: `${email} (IMAP)`,
      imapHost,
      imapPort: imapPort || 993,
      smtpHost: smtpHost || imapHost,
      smtpPort: smtpPort || 465,
      encryptedUsername: encrypt(username),
      encryptedPassword: encrypt(password),
      sentFolderName: sentFolderName || "Sent Messages",
    },
    update: {
      imapHost,
      imapPort: imapPort || 993,
      smtpHost: smtpHost || imapHost,
      smtpPort: smtpPort || 465,
      encryptedUsername: encrypt(username),
      encryptedPassword: encrypt(password),
      sentFolderName: sentFolderName || "Sent Messages",
    },
  });

  return NextResponse.json({ id: account.id, email: account.email, status: "connected" });
}
