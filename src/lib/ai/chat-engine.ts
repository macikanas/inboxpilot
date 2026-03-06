import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { emailTools, getOpenAITools } from "./tools";
import { searchEmails, readEmail, markEmail, listFolders, type EmailAccountConfig } from "../email/imap-client";
import { sendEmail } from "../email/smtp-client";

const SYSTEM_PROMPT = `You are InboxPilot, an AI email assistant. You help users search, read, understand, and respond to their emails through natural conversation.

Key behaviors:
- Use the available tools to interact with the user's email
- Respond in the same language the user writes in
- When asked to send an email, ALWAYS show the draft first and ask for confirmation
- Summarize emails concisely — highlight key info, action items, and important details
- When multiple emails are found, present them in a clear organized way
- Be helpful and proactive — suggest follow-ups, flag important items`;

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
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (err: any) {
    return JSON.stringify({ error: err.message });
  }
}

// ─── Claude (Anthropic) ──────────────────────────────────────────

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

// ─── OpenAI ──────────────────────────────────────────────────────

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
        const args = JSON.parse(toolCall.function.arguments);
        yield `\n[Calling ${toolCall.function.name}...]\n`;

        const toolResult = await executeToolCall(toolCall.function.name, args, account);

        openaiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
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
