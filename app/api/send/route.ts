import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { hasErrors, normalizeContact, validateContact } from "./validation";

export const runtime = "nodejs";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Removes CR/LF and other control characters so a value is safe in a mail header. */
const headerSafe = (value: string) =>
  value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Request body must be valid JSON" },
      { status: 400 }
    );
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, message: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const input = normalizeContact(body);

  // Honeypot filled: almost certainly a bot. Pretend it worked, send nothing.
  if (input.company) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateContact(input);
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const user = process.env.BURNER_EMAIL;
  const pass = process.env.BURNER_PASSWORD;
  const to = process.env.EMAIL;
  if (!user || !pass || !to) {
    return NextResponse.json(
      { ok: false, message: "Email is not configured" },
      { status: 503 }
    );
  }

  const name = headerSafe(input.name);
  const email = headerSafe(input.email);
  const subject = headerSafe(input.subject);
  const sender = name || email;

  const textBody = [
    `From: ${name ? `${name} <${email}>` : email}`,
    `Subject: ${subject}`,
    "",
    input.message,
  ].join("\n");

  const htmlBody = [
    `<p><strong>From:</strong> ${escapeHtml(name ? `${name} <${email}>` : email)}</p>`,
    `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
    `<p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>`,
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: { name: "Portfolio contact form", address: user },
      to,
      replyTo: name ? { name, address: email } : email,
      subject: `Portfolio message from ${sender}: ${subject}`,
      text: textBody,
      html: htmlBody,
    });
  } catch (error) {
    console.error("[api/send] Failed to send contact email:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to send the message right now" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
