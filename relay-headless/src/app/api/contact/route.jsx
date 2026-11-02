import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildMail, ContactError, getMailConfig, readBoundedForm, validateContact } from "./contact-core.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  let config;
  try { config = getMailConfig(process.env); }
  catch {
    console.error("Relay contact mail is not configured");
    return NextResponse.json({ ok: false, error: "Contact form temporarily unavailable." }, { status: 503 });
  }
  try {
    const contact = validateContact(await readBoundedForm(request));
    if (contact.kind === "honeypot") return NextResponse.json({ ok: true });
    const transporter = nodemailer.createTransport({
      service: "gmail", auth: { user: config.user, pass: config.pass }
      // Keep default TLS certificate verification enabled.
    });
    await transporter.sendMail(buildMail(contact.data, config.recipient, config.user));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ContactError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error("Relay contact mail delivery failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ ok: false, error: "Could not deliver your message." }, { status: 502 });
  }
}
