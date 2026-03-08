import { ImapFlow } from "imapflow";
// @ts-expect-error - mailparser lacks type declarations
import { simpleParser, ParsedMail } from "mailparser";
import { decrypt } from "../crypto";

export interface EmailAccountConfig {
  provider: string;
  imapHost: string | null;
  imapPort: number | null;
  encryptedUsername: string | null;
  encryptedPassword: string | null;
  sentFolderName: string;
}

interface EmailSummary {
  uid: number;
  subject: string;
  from: string;
  to: string;
  date: string;
  flags: string[];
  isRead: boolean;
}

interface EmailFull {
  uid: number;
  subject: string;
  from: string;
  to: string;
  cc: string;
  date: string;
  messageId: string;
  inReplyTo: string;
  body: string;
  attachments: { filename: string; size: number; contentType: string }[];
}

function getImapConfig(account: EmailAccountConfig) {
  if (!account.imapHost || !account.encryptedUsername || !account.encryptedPassword) {
    throw new Error("IMAP credentials not configured");
  }
  return {
    host: account.imapHost,
    port: account.imapPort || 993,
    secure: true,
    auth: {
      user: decrypt(account.encryptedUsername),
      pass: decrypt(account.encryptedPassword),
    },
    logger: false as const,
  };
}

async function withImap<T>(account: EmailAccountConfig, fn: (client: ImapFlow) => Promise<T>): Promise<T> {
  const client = new ImapFlow(getImapConfig(account));
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.logout();
  }
}

export async function testConnection(account: EmailAccountConfig): Promise<boolean> {
  return withImap(account, async () => true);
}

export async function listFolders(account: EmailAccountConfig) {
  return withImap(account, async (client) => {
    const folders: { name: string; path: string; specialUse?: string }[] = [];
    const list = await client.list();
    for (const folder of list) {
      folders.push({ name: folder.name, path: folder.path, specialUse: folder.specialUse || undefined });
    }
    return folders;
  });
}

export async function searchEmails(
  account: EmailAccountConfig,
  opts: { subject?: string; from?: string; body?: string; folder?: string; since?: string; before?: string; limit?: number }
): Promise<EmailSummary[]> {
  return withImap(account, async (client) => {
    const folder = opts.folder || "INBOX";
    const lock = await client.getMailboxLock(folder);
    try {
      const query: Record<string, any> = {};
      if (opts.subject) query.subject = opts.subject;
      if (opts.from) query.from = opts.from;
      if (opts.body) query.body = opts.body;
      if (opts.since) query.since = new Date(opts.since);
      if (opts.before) query.before = new Date(opts.before);
      if (Object.keys(query).length === 0) query.all = true;

      const results: EmailSummary[] = [];
      for await (const msg of client.fetch(query, { envelope: true, flags: true, uid: true })) {
        results.push({
          uid: msg.uid,
          subject: msg.envelope?.subject || "(no subject)",
          from: msg.envelope?.from?.map((a: any) => `${a.name || ""} <${a.address}>`).join(", ") || "",
          to: msg.envelope?.to?.map((a: any) => `${a.name || ""} <${a.address}>`).join(", ") || "",
          date: msg.envelope?.date?.toISOString() || "",
          flags: [...(msg.flags || [])],
          isRead: msg.flags?.has("\\Seen") || false,
        });
      }
      const limit = Math.min(opts.limit || 20, 100);
      return results.slice(-limit).reverse();
    } finally {
      lock.release();
    }
  });
}

export async function readEmail(account: EmailAccountConfig, uid: number, folder: string = "INBOX"): Promise<EmailFull> {
  return withImap(account, async (client) => {
    const lock = await client.getMailboxLock(folder);
    try {
      const raw = await client.download(uid.toString(), undefined, { uid: true });
      const parsed: ParsedMail = await simpleParser(raw.content);
      return {
        uid,
        subject: parsed.subject || "(no subject)",
        from: parsed.from?.text || "",
        to: parsed.to?.text || "",
        cc: parsed.cc?.text || "",
        date: parsed.date?.toISOString() || "",
        messageId: parsed.messageId || "",
        inReplyTo: parsed.inReplyTo || "",
        body: parsed.text || parsed.html?.replace(/<[^>]+>/g, "") || "",
        attachments: (parsed.attachments || []).map((a: any) => ({
          filename: a.filename || "unknown",
          size: a.size,
          contentType: a.contentType,
        })),
      };
    } finally {
      lock.release();
    }
  });
}

export async function markEmail(
  account: EmailAccountConfig,
  uid: number,
  action: "read" | "unread" | "flag" | "unflag",
  folder: string = "INBOX"
) {
  return withImap(account, async (client) => {
    const lock = await client.getMailboxLock(folder);
    try {
      const uidStr = uid.toString();
      switch (action) {
        case "read": await client.messageFlagsAdd(uidStr, ["\\Seen"], { uid: true }); break;
        case "unread": await client.messageFlagsRemove(uidStr, ["\\Seen"], { uid: true }); break;
        case "flag": await client.messageFlagsAdd(uidStr, ["\\Flagged"], { uid: true }); break;
        case "unflag": await client.messageFlagsRemove(uidStr, ["\\Flagged"], { uid: true }); break;
      }
    } finally {
      lock.release();
    }
  });
}

export async function saveToSent(account: EmailAccountConfig, rawMessage: string) {
  return withImap(account, async (client) => {
    await client.append(account.sentFolderName, rawMessage, ["\\Seen"]);
  });
}

// ─── Delete emails (move to Trash or permanent) ────────────────

export async function deleteEmail(
  account: EmailAccountConfig,
  uids: number | number[],
  folder: string = "INBOX",
  permanent: boolean = false
): Promise<{ deleted: number[] }> {
  const uidList = Array.isArray(uids) ? uids : [uids];
  return withImap(account, async (client) => {
    const lock = await client.getMailboxLock(folder);
    try {
      if (permanent) {
        for (const uid of uidList) {
          await client.messageDelete(uid.toString(), { uid: true });
        }
      } else {
        // Find the Trash folder
        const folders = await client.list();
        const trashFolder = folders.find(
          (f: any) => f.specialUse === "\\Trash" || /^(trash|deleted|bin)/i.test(f.path)
        );
        const trashPath = trashFolder?.path || "Trash";
        for (const uid of uidList) {
          await client.messageMove(uid.toString(), trashPath, { uid: true });
        }
      }
      return { deleted: uidList };
    } finally {
      lock.release();
    }
  });
}

// ─── Move emails between folders ───────────────────────────────

export async function moveEmail(
  account: EmailAccountConfig,
  uids: number | number[],
  fromFolder: string = "INBOX",
  toFolder: string
): Promise<{ moved: number[]; to: string }> {
  const uidList = Array.isArray(uids) ? uids : [uids];
  return withImap(account, async (client) => {
    const lock = await client.getMailboxLock(fromFolder);
    try {
      for (const uid of uidList) {
        await client.messageMove(uid.toString(), toFolder, { uid: true });
      }
      return { moved: uidList, to: toFolder };
    } finally {
      lock.release();
    }
  });
}

// ─── Get email headers (for unsubscribe) ───────────────────────

export async function getEmailHeaders(
  account: EmailAccountConfig,
  uid: number,
  folder: string = "INBOX"
): Promise<{ listUnsubscribe?: string; listUnsubscribePost?: string; from: string; subject: string }> {
  return withImap(account, async (client) => {
    const lock = await client.getMailboxLock(folder);
    try {
      const raw = await client.download(uid.toString(), undefined, { uid: true });
      const parsed: ParsedMail = await simpleParser(raw.content);
      const headers = parsed.headers;
      return {
        listUnsubscribe: headers?.get("list-unsubscribe")?.toString() || undefined,
        listUnsubscribePost: headers?.get("list-unsubscribe-post")?.toString() || undefined,
        from: parsed.from?.text || "",
        subject: parsed.subject || "",
      };
    } finally {
      lock.release();
    }
  });
}
