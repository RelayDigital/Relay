import assert from "node:assert/strict";
import test from "node:test";
import { buildMail, ContactError, escapeHtml, getMailConfig, MAX_CONTACT_BYTES, readBoundedForm, validateContact } from "../src/app/api/contact/contact-core.mjs";
const good = { name: "Taylor", email: "TAYLOR@example.com", phone: "+1 555 123 0000", website: "example.com", message: "Hi <script>alert(1)</script>\nThanks" };
function form(data = good) { const f = new FormData(); for (const [k,v] of Object.entries(data)) f.append(k,v); return f; }
function request(data = good) { return new Request("https://relay.invalid/api/contact", {method:"POST",body:form(data)}); }
test("accepts multipart form and normalizes email", async () => {
  const r=validateContact(await readBoundedForm(request()));
  assert.equal(r.kind,"valid"); assert.equal(r.data.email,"taylor@example.com");
});
test("accepts URL encoded forms", async () => {
  const r = new Request("https://relay.invalid/api/contact", {method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams(good)});
  assert.equal(validateContact(await readBoundedForm(r)).kind,"valid");
});
test("rejects wrong content types and malformed payloads", async () => {
  await assert.rejects(readBoundedForm(new Request("https://relay.invalid", {method:"POST",headers:{"content-type":"text/plain"},body:"hi"})),e=>e.status===415);
  await assert.rejects(readBoundedForm(new Request("https://relay.invalid", {method:"POST",headers:{"content-type":"multipart/form-data; boundary=wrong"},body:"bad"})),ContactError);
});
test("rejects declared and streamed oversized requests", async () => {
  await assert.rejects(readBoundedForm(new Request("https://relay.invalid", {method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","content-length":String(MAX_CONTACT_BYTES+1)},body:"name=a"})),e=>e.status===413);
  await assert.rejects(readBoundedForm(new Request("https://relay.invalid", {method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:"name="+ "x".repeat(MAX_CONTACT_BYTES)})),e=>e.status===413);
});
test("rejects missing and malformed fields", () => {
  for (const data of [{...good,email:"invalid"},{...good,name:""},{...good,message:"x".repeat(3001)},{...good,email:"bad\n@example.com"}]) assert.throws(()=>validateContact(form(data)),ContactError);
});
test("honeypot does not become an email", () => assert.equal(validateContact(form({...good,botcheck:"yes"})).kind,"honeypot"));
test("escapes HTML and preserves readable text", () => {
  const data=validateContact(form()).data, mail=buildMail(data,"owner@example.com","relay@example.com");
  assert.ok(mail.html.includes("&lt;script&gt;")); assert.ok(!mail.html.includes("<script>"));
  assert.ok(mail.html.includes("<br>")); assert.ok(mail.text.includes("<script>"));
  assert.equal(mail.replyTo,"taylor@example.com"); assert.equal(mail.to,"owner@example.com");
});
test("requires server-only SMTP configuration", () => {
  assert.throws(()=>getMailConfig({NEXT_PUBLIC_EMAIL_PASSWORD:"old"}));
  assert.deepEqual(getMailConfig({CONTACT_SMTP_USER:"relay@example.com",CONTACT_SMTP_APP_PASSWORD:"app-password",CONTACT_RECIPIENT:"owner@example.com"}),{user:"relay@example.com",pass:"app-password",recipient:"owner@example.com"});
  assert.throws(()=>getMailConfig({CONTACT_SMTP_USER:"not-email",CONTACT_SMTP_APP_PASSWORD:"x",CONTACT_RECIPIENT:"owner@example.com"}));
});
test("escapes ampersands and quotes",()=>assert.equal(escapeHtml("\"&'<"), "&quot;&amp;&#39;&lt;"));
