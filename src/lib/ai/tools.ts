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
  {
    name: "delete_email",
    description: "Delete one or more emails. IMPORTANT: Always confirm with the user before deleting and tell them how many emails will be affected. By default moves to Trash; set permanent=true to permanently delete.",
    input_schema: {
      type: "object" as const,
      properties: {
        uid: { type: "number", description: "Email UID to delete (for single email)" },
        uids: { type: "array", items: { type: "number" }, description: "Array of UIDs to delete (for bulk)" },
        folder: { type: "string", description: "Source folder (default: INBOX)" },
        permanent: { type: "boolean", description: "If true, permanently delete instead of moving to Trash (default: false)" },
      },
      required: [],
    },
  },
  {
    name: "move_email",
    description: "Move one or more emails to another folder. Common destinations: 'Archive' for archiving, 'Junk' or 'Spam' for spam, any custom folder name. Use list_folders first if unsure about folder names.",
    input_schema: {
      type: "object" as const,
      properties: {
        uid: { type: "number", description: "Email UID to move (for single email)" },
        uids: { type: "array", items: { type: "number" }, description: "Array of UIDs to move (for bulk)" },
        from_folder: { type: "string", description: "Source folder (default: INBOX)" },
        to_folder: { type: "string", description: "Destination folder name" },
      },
      required: ["to_folder"],
    },
  },
  {
    name: "forward_email",
    description: "Forward an email to another recipient. Optionally add a comment above the forwarded content. IMPORTANT: Always show the user what will be forwarded and confirm before sending.",
    input_schema: {
      type: "object" as const,
      properties: {
        uid: { type: "number", description: "Email UID to forward" },
        folder: { type: "string", description: "Folder containing the email (default: INBOX)" },
        to: { type: "string", description: "Recipient email address(es), comma-separated" },
        comment: { type: "string", description: "Optional message to add above the forwarded email" },
      },
      required: ["uid", "to"],
    },
  },
  {
    name: "unsubscribe",
    description: "Unsubscribe from a mailing list by reading the email's List-Unsubscribe header and acting on it. Works for newsletters and marketing emails that include unsubscribe headers.",
    input_schema: {
      type: "object" as const,
      properties: {
        uid: { type: "number", description: "Email UID of the newsletter/mailing list email" },
        folder: { type: "string", description: "Folder containing the email (default: INBOX)" },
      },
      required: ["uid"],
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
