import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchEmails, type EmailAccountConfig } from "@/lib/email/imap-client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { emailAccounts: { where: { isActive: true } } },
  });

  if (!user || !user.emailAccounts[0]) {
    return new Response(JSON.stringify({ error: "No email account" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const account = user.emailAccounts[0];
  const config: EmailAccountConfig = {
    provider: account.provider,
    imapHost: account.imapHost,
    imapPort: account.imapPort,
    encryptedUsername: account.encryptedUsername,
    encryptedPassword: account.encryptedPassword,
    sentFolderName: account.sentFolderName,
  };

  const url = new URL(req.url);
  const folder = url.searchParams.get("folder") || "INBOX";
  const limit = parseInt(url.searchParams.get("limit") || "30");

  try {
    const emails = await searchEmails(config, { folder, limit });
    return new Response(JSON.stringify(emails), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
