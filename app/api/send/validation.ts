/**
 * Contact form rules, shared by the form (client) and the route (server) so
 * the two can never disagree. Pure TypeScript: no Node or browser APIs.
 */

export type ContactField = "name" | "email" | "subject" | "message";

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot. Humans never see it; it must stay empty. */
  company: string;
}

export type ContactErrors = Partial<Record<ContactField, string>>;

export const CONTACT_LIMITS = {
  nameMax: 80,
  emailMax: 254,
  subjectMin: 2,
  subjectMax: 120,
  messageMin: 10,
  messageMax: 4000,
} as const;

// Deliberately simple: one @, no spaces or header-ish characters, a dot in the domain.
const EMAIL_PATTERN = /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\.]{2,}$/;

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** Coerces arbitrary JSON into trimmed string fields. Never throws. */
export function normalizeContact(raw: unknown): ContactInput {
  const source: Record<string, unknown> =
    typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    name: text(source.name).trim(),
    email: text(source.email).trim(),
    subject: text(source.subject).trim(),
    message: text(source.message).replace(/\r\n?/g, "\n").trim(),
    company: text(source.company).trim(),
  };
}

/** Returns one message per invalid field; an empty object means valid. */
export function validateContact(input: ContactInput): ContactErrors {
  const L = CONTACT_LIMITS;
  const errors: ContactErrors = {};

  if (input.name.length > L.nameMax) {
    errors.name = `Name must be ${L.nameMax} characters or fewer.`;
  }

  if (!input.email) {
    errors.email = "Enter your email address.";
  } else if (input.email.length > L.emailMax || !EMAIL_PATTERN.test(input.email)) {
    errors.email = "Enter a valid email address, like name@example.com.";
  }

  if (!input.subject) {
    errors.subject = "Enter a subject.";
  } else if (input.subject.length < L.subjectMin || input.subject.length > L.subjectMax) {
    errors.subject = `Subject must be ${L.subjectMin}–${L.subjectMax} characters.`;
  }

  if (!input.message) {
    errors.message = "Enter a message.";
  } else if (input.message.length < L.messageMin) {
    errors.message = `Message must be at least ${L.messageMin} characters.`;
  } else if (input.message.length > L.messageMax) {
    errors.message = `Message must be ${L.messageMax} characters or fewer.`;
  }

  return errors;
}

export const hasErrors = (errors: ContactErrors) => Object.keys(errors).length > 0;
