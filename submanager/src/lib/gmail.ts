import { google } from "googleapis";

export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

// Search queries to find subscription-related emails
const SEARCH_QUERIES = [
  "subject:(receipt OR invoice OR payment OR billing OR subscription OR 결제 OR 영수증 OR 청구)",
  "from:(noreply OR billing OR payments OR invoice OR receipt)",
  "subject:(renewed OR renewal OR charge OR 갱신 OR 청구서)",
];

export interface RawEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
}

export async function scanEmails(
  accessToken: string,
  maxResults = 100
): Promise<RawEmail[]> {
  const gmail = getGmailClient(accessToken);
  const emails: RawEmail[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const res = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: Math.floor(maxResults / SEARCH_QUERIES.length),
      });

      const messages = res.data.messages || [];

      for (const msg of messages) {
        // Skip duplicates
        if (emails.some((e) => e.id === msg.id)) continue;

        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "full",
          });

          const headers = detail.data.payload?.headers || [];
          const subject =
            headers.find((h) => h.name === "Subject")?.value || "";
          const from =
            headers.find((h) => h.name === "From")?.value || "";
          const date =
            headers.find((h) => h.name === "Date")?.value || "";

          // Extract body text
          let body = "";
          const parts = detail.data.payload?.parts || [];
          if (parts.length > 0) {
            const textPart = parts.find(
              (p) => p.mimeType === "text/plain"
            );
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, "base64").toString(
                "utf-8"
              );
            }
          } else if (detail.data.payload?.body?.data) {
            body = Buffer.from(
              detail.data.payload.body.data,
              "base64"
            ).toString("utf-8");
          }

          emails.push({
            id: msg.id!,
            subject,
            from,
            date,
            snippet: detail.data.snippet || "",
            body,
          });
        } catch {
          // Skip individual email errors
          continue;
        }
      }
    } catch {
      // Skip query errors
      continue;
    }
  }

  return emails;
}
