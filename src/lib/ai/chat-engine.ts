import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { emailTools, getOpenAITools } from "./tools";
import { searchEmails, readEmail, markEmail, listFolders, deleteEmail, moveEmail, getEmailHeaders, type EmailAccountConfig } from "../email/imap-client";
import { sendEmail } from "../email/smtp-client";

const SYSTEM_PROMPT = `You are InboxPilot, an AI email assistant. You help users search, read, understand, manage, and respond to their emails through natural conversation.

Key behaviors:
- Use the available tools to interact with the user's email
- Respond in the same language the user writes in
- When asked to send or forward an email, ALWAYS show the draft first and ask for confirmation
- When asked to delete emails, ALWAYS confirm with the user first â tell them exactly how many emails will be affected and which ones
- When moving emails, confirm the destination folder with the user
- For bulk operations (delete all, move all, etc.), search first, show what was found, get confirmation, then act
- Summarize emails concisely â highlight key info, action items, and important details
- When multiple emails are found, present them in a clear organized way
- Be helpful and proactive â suggest follow-ups, flag important items, offer to unsubscribe from newsletters
- For unsubscribe requests, read the email first to check for List-Unsubscribe headers, then use the unsubscribe tool`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  imapHost: string | null;
  imapPort: number | null;
  smtpHost: string | null;
  smtpPort: number | null;
  encryptedUsername: string | null;
  encryptedPassword: string | null;
  sentFolderName: string;
}

async function executeToolCall(toolName: string, input: Record<string, any>, account: EmailAccount): Promise<string> {
  const config: EmailAccountConfig = {
    provider: account.provider,
    imapHost: account.imapHost,
    imapPort: account.imapPort,
    encryptedUsername: account.encryptedUsername,
    encryptedPassword: account.encryptedPassword,
    sentFolderName: account.sentFolderName,
  };

  try {
    switch (toolName) {
      case "search_emails": {
        const results = await searchEmails(config, {
          subject: input.subject,
          from: input.from,
          body: input.body,
          folder: input.folder,
          since: input.since,
          before: input.before,
          limit: input.limit,
        });
        return JSON.stringify(results, null, 2);
      }
      case "read_email": {
        const email = await readEmail(config, input.uid, input.folder || "INBOX");
        return JSON.stringify(email, null, 2);
      }
      case "send_email": {
        const result = await sendEmail(
          { ...config, smtpHost: account.smtpHost, smtpPort: account.smtpPort, email: account.email },
          { to: input.to, subject: input.subject, body: input.body, cc: input.cc, inReplyTo: input.inReplyTo }
        );
        return JSON.stringify(result);
      }
      case "mark_email": {
        await markEmail(config, input.uid, input.action, input.folder || "INBOX");
        return JSON.stringify({ status: "done", uid: input.uid, action: input.action });
      }
      case "list_folders": {
        const folders = await listFolders(config);
        return JSON.stringify(folders, null, 2);
      }
      case "delete_email": {
        const uids = input.uids || (input.uid ? [input.uid] : []);
        if (uids.length === 0) return JSON.stringify({ error: "No UIDs provided" });
        const result = await deleteEmail(config, uids, input.folder || "INBOX", input.permanent || false);
        return JSON.stringify(result);
      }
      case "move_email": {
        const uids = input.uids || (input.uid ? [input.uid] : []);
        if (uids.length === 0) return JSON.stringify({ error: "No UIDs provided" });
        const result = await moveEmail(config, uids, input.from_folder || "INBOX", input.to_folder);
        return JSON.stringify(result);
      }
      case "forward_email": {
        const email = await readEmail(config, input.uid, input.folder || "INBOX");
        const fwdBody = [
          input.comment || "",
          input.comment ? "\n\n" : "",
          "---------- Forwarded message ----------",
          `From: ${email.from}`,
          `Date: ${email.date}`,
          `Subject: ${email.subject}`,
          `To: ${email.to}`,
          "",
          email.body,
        ].join("\n");
        const result = await sendEmail(
          { ...config, smtpHost: account.smtpHost, smtpPort: account.smtpPort, email: account.email },
          { to: input.to, subject: `Fwd: ${email.subject}`, body: fwdBody }
        );
        return JSON.stringify(result);
      }
      case "unsubscribe": {
        const headers = await getEmailHeaders(config, input.uid, input.folder || "INBOX");
        if (!headers.listUnsubscribe) {
          return JSON.stringify({ error: "No List-Unsubscribe header found in this email. It may not be a mailing list." });
        }
        const unsubHeader = headers.listUnsubscribe;
        // Parse mailto: and https: links from the header
        const mailtoMatch = unsubHeader.match(/<mailto:([^>]+)>/i);
        const httpsMatch = unsubHeader.match(/<(https?:\/\/[^>]+)>/i);
        const actions: string[] = [];

        if (mailtoMatch) {
          const unsubEmail = mailtoMatch[1].split("?")[0]; // strip query params
          const subjectMatch = mailtoMatch[1].match(/subject=([^&]*)/i);
          try {
            await sendEmail(
              { ...config, smtpHost: account.smtpHost, smtpPort: account.smtpPort, email: account.email },
              { to: unsubEmail, subject: subjectMatch ? decodeURIComponent(subjectMatch[1]) : "Unsubscribe", body: "Unsubscribe" }
            );
            actions.push(`Sent unsubscribe email to ${unsubEmail}`);
          } catch (e: any) {
            actions.push(`Failed to send unsubscribe email: ${e.message}`);
          }
        }

        if (httpsMatch) {
          actions.push(`Unsubscribe link: ${httpsMatch[1]} â click this link to complete unsubscription`);
        }

        if (actions.length === 0) {
          return JSON.stringify({ error: "Could not parse unsubscribe options from header", raw: unsubHeader });
        }

        return JSON.stringify({
          status: "processed",
          from: headers.from,
          subject: headers.subject,
          actions,
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (err: any) {
    return JSON.stringify({ error: err.message });
  }
}

// âââ Claude (Anthropic) ââââââââââââââââââââââââââââââââââââââââââ

export async function* chatWithClaude(
  messages: ChatMessage[],
  account: EmailAccount,
  model: string = "claude-sonnet-4-20250514"
): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const anthropicMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  let continueLoop = true;
  while (continueLoop) {
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: emailTools as any,
      messages: anthropicMessages,
    });

    let textContent = "";
    let hasToolUse = false;

    for (const block of response.content) {
      if (block.type === "text") {
        textContent += block.text;
        yield block.text;
      } else if (block.type === "tool_use") {
        hasToolUse = true;
        yield `\n[Calling ${block.name}...]\n`;

        const toolResult = await executeToolCall(block.name, block.input as Record<string, any>, account);

        // Add assistant response and tool result to messages
        anthropicMessages.push({ role: "assistant", content: response.content as any });
        anthropicMessages.push({
          role: "user",
          content: [{ type: "tool_result", tool_use_id: block.id, content: toolResult }] as any,
        });
      }
    }

    if (!hasToolUse) {
      continueLoop = false;
    }
  }
}

// âââ OpenAI ââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function* chatWithOpenAI(
  messages: ChatMessage[],
  account: EmailAccount,
  model: string = "gpt-4o"
): AsyncGenerator<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  let continueLoop = true;
  while (continueLoop) {
    const response = await client.chat.completions.create({
      model,
      messages: openaiMessages,
      tools: getOpenAITools(),
    });

    const choice = response.choices[0];
    if (!choice) break;

    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      openaiMessages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type !== "function") continue;
        const fnCall = toolCall as { id: string; type: "function"; function: { name: string; arguments: string } };
        const args = JSON.parse(fnCall.function.arguments);
        yield `\n[Calling ${fnCall.function.name}...]\n`;

        const toolResult = await executeToolCall(fnCall.function.name, args, account);

        openaiMessages.push({
          role: "tool",
          tool_call_id: fnCall.id,
          content: toolResult,
        });
      }
    } else {
      const text = choice.message.content || "";
      yield text;
      continueLoop = false;
    }
  }
}
