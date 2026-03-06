export const emailTools = [
  {
    name: "search_emails",
    description: "Search for emails in the user's mailbox by subject, sender, body text, or date range. Returns a list of matching emails with subject, sender, date.",
    input_schema: {
      type: "object" as const,
      properties: {
        subject: { type: "string", description: "Search in subject line" },
        from: { type: "string", description: "Filter by sender email or name" },
        body: { type: "string", description: "Search in email body text" },
        folder: { type: "string", description: "Folder to search (default: INBOX)" },
        since: { type: "string", description: "Emails after this date (YYYY-MM-DD)" },
        before: { type: "string", description: "Emails before this date (YYYY-MM-DD)" },
        limit: { type: "number", description: "Max results (default: 20, max: 100)" },
      },
      required: [],
    },
  },
  {
    name: "read_email",
    description: "Read the full content of a specific email by its UID. Returns subject, from, to, body, attachments.",
    input_schema: {
      type: "object" as const,
      properties: {
        uid: { type: "number", description: "Email UID from search results" },
        folder: { type: "string", description: "Folder (default: INBOX)" },
      },
      required: ["uid"],
    },
  },
  {
    name: "send_email",
    description: "Send an email. IMPORTANT: Always show the draft to the user and get confirmation before calling this tool.",
    input_schema: {
      type: "object" as const,
      properties: {
        to: { type: "string", description: "Recipient email(s), comma-separated" },
        subject: { type: "string", description: "Email subject" },
        body: { type: "string", description: "Email body (plain text)" },
        cc: { type: "string", description: "CC recipients" },
        inReplyTo: { type: "string", description: "Message-ID to reply to" },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    name: "mark_email",
    description: "Mark an email as read, unread, flagged, or unflagged",
    input_schema: {
      type: "object" as const,
      properties: {
        uid: { type: "number", description: "Email UID" },
        action: { type: "string", enum: ["read", "unread", "flag", "unflag"], description: "Action to perform" },
        folder: { type: "string", description: "Folder (default: INBOX)" },
      },
      required: ["uid", "action"],
    },
  },
  {
    name: "list_folders",
    description: "List all mailbox folders",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// Convert to OpenAI function calling format
export function getOpenAITools() {
  return emailTools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  }));
}
