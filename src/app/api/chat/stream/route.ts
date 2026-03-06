import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatWithClaude, chatWithOpenAI } from "@/lib/ai/chat-engine";

export async function POST(req: Request) {
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
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { message, conversationId } = await req.json();
  if (!message) {
    return new Response(JSON.stringify({ error: "Message required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get or create conversation
  let conversation;
  if (conversationId) {
    conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
    });
  }
  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        userId: user.id,
        title: message.substring(0, 100),
        messages: { create: [] },
      },
      include: { messages: true },
    });
  }

  // Save user message
  await db.message.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  // Get primary email account
  const account = user.emailAccounts[0];
  if (!account) {
    return new Response(
      JSON.stringify({ error: "No email account connected. Please connect one in settings." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Build message history
  const history = [
    ...conversation.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: message },
  ];

  // Stream response via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      try {
        const provider = user.preferredAIProvider || "claude";
        const chatFn = provider === "openai" ? chatWithOpenAI : chatWithClaude;
        const model = user.preferredAIModel || (provider === "openai" ? "gpt-4o" : "claude-sonnet-4-20250514");

        for await (const chunk of chatFn(history, account, model)) {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }

        // Save assistant response
        await db.message.create({
          data: { conversationId: conversation!.id, role: "assistant", content: fullResponse },
        });

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: conversation!.id })}\n\n`));
      } catch (err: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
