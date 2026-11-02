export const MAX_CONTACT_BYTES = 8192;
export class ContactError extends Error {
  constructor(message, status = 400) { super(message); this.name = "ContactError"; this.status = status; }
}
export async function readBoundedForm(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!/^(multipart\/form-data\s*;|application\/x-www-form-urlencoded(?:\s*;|\s*$))/i.test(contentType)) {
    throw new ContactError("Unsupported form content type.", 415);
  }
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_CONTACT_BYTES)) {
    throw new ContactError("Submission too large.", 413);
  }
  if (!request.body) throw new ContactError("Missing form body.");
  const reader = request.body.getReader(), chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_CONTACT_BYTES) {
        await reader.cancel().catch(() => {});
        throw new ContactError("Submission too large.", 413);
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof ContactError) throw error;
    throw new ContactError("Invalid form body.");
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  try {
    return await new Request("https://relay.invalid/form", {
      method: "POST", headers: { "content-type": contentType }, body
    }).formData();
  } catch { throw new ContactError("Malformed form body."); }
}
const clean = (form, key, max, required = true) => {
  const value = form.get(key);
  if (value === null && !required) return "";
  if (typeof value !== "string") throw new ContactError("Invalid form fields.");
  const text = value.trim();
  if ((required && !text) || text.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) {
    throw new ContactError("Invalid form fields.");
  }
  return text;
};
export function validateContact(form) {
  if (form.get("botcheck")) return { kind: "honeypot" };
  const name = clean(form, "name", 120);
  const email = clean(form, "email", 254).toLowerCase();
  const phone = clean(form, "phone", 60, false);
  const website = clean(form, "website", 300, false);
  const message = clean(form, "message", 3000);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new ContactError("Invalid email address.");
  return { kind: "valid", data: { name, email, phone, website, message } };
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
export function buildMail(data, recipient, sender) {
  const rows = [["Name", data.name], ["Email", data.email], ["Phone", data.phone], ["Website", data.website], ["Message", data.message]];
  const text = rows.map(([key, value]) => `${key}: ${value}`).join("\n\n");
  const html = `<h1>Relay Digital contact enquiry</h1>${rows.map(([key, value]) =>
    `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value).replace(/\n/g, "<br>")}</p>`).join("")}`;
  return { from: sender, to: recipient, replyTo: data.email, subject: "Relay Digital website enquiry", text, html };
}
export function getMailConfig(env) {
  const user = env.CONTACT_SMTP_USER, pass = env.CONTACT_SMTP_APP_PASSWORD, recipient = env.CONTACT_RECIPIENT;
  if (![user, pass, recipient].every(x => typeof x === "string" && x.trim())) {
    throw new Error("Contact mail environment is not configured");
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(user) ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient)) {
    throw new Error("Contact mail address configuration is invalid");
  }
  return { user, pass, recipient };
}
