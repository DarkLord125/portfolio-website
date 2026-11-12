"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/util";
import {
  CONTACT_LIMITS,
  hasErrors,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactInput,
} from "@/app/api/send/validation";
import { actionClass } from "./primitives";

type Status = "idle" | "sending" | "success" | "error";

const EMPTY: ContactInput = { name: "", email: "", subject: "", message: "", company: "" };
const FIELD_ORDER: ContactField[] = ["name", "email", "subject", "message"];
const GENERIC_FAILURE = "The message could not be sent. Please try again.";

const INPUT =
  "focus-ring block min-h-[44px] w-full rounded-sm border bg-space-950/60 px-3 py-2.5 font-body text-base text-slate-50 placeholder:text-slate-500 md:text-sm";

interface SendResponse {
  ok: boolean;
  message?: string;
  errors?: ContactErrors;
}

function readResponse(data: unknown): SendResponse {
  if (typeof data !== "object" || data === null) return { ok: false };
  const record = data as Record<string, unknown>;
  const errors: ContactErrors = {};
  if (typeof record.errors === "object" && record.errors !== null) {
    const raw = record.errors as Record<string, unknown>;
    for (const field of FIELD_ORDER) {
      const message = raw[field];
      if (typeof message === "string") errors[field] = message;
    }
  }
  return {
    ok: record.ok === true,
    message: typeof record.message === "string" ? record.message : undefined,
    errors: hasErrors(errors) ? errors : undefined,
  };
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-space-950/30 border-t-space-950"
    />
  );
}

/** Contact form used by the Contact panel and the /lite page. Posts JSON to /api/send. */
export function ContactForm({ className }: { className?: string }) {
  const uid = useId();
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const refocusForm = useRef(false);

  const sending = status === "sending";
  const fieldId = (field: string) => `${uid}-${field}`;
  const errorId = (field: ContactField) => `${uid}-${field}-error`;

  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus();
    } else if (status === "idle" && refocusForm.current) {
      refocusForm.current = false;
      formRef.current?.querySelector<HTMLElement>("input:not([tabindex='-1'])")?.focus();
    }
  }, [status]);

  const set = (field: keyof ContactInput, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear a field's error as soon as the visitor starts fixing it.
    if (field !== "company" && errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const validateField = (field: ContactField) => {
    const message = validateContact(normalizeContact(values))[field];
    setErrors((e) => ({ ...e, [field]: message }));
  };

  const focusFirstInvalid = (found: ContactErrors) => {
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) document.getElementById(fieldId(first))?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;

    const input = normalizeContact(values);
    const found = validateContact(input);
    setErrors(found);
    if (hasErrors(found)) {
      focusFirstInvalid(found);
      return;
    }

    setStatus("sending");
    setFailure("");
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = readResponse(await response.json().catch(() => null));

      if (response.ok && result.ok) {
        setValues(EMPTY);
        setStatus("success");
        toast.success("Message sent");
        return;
      }
      if (response.status === 400 && result.errors) {
        setErrors(result.errors);
        setStatus("idle");
        focusFirstInvalid(result.errors);
        toast.error("Please check the highlighted fields");
        return;
      }
      setFailure(
        response.status === 503
          ? "The contact form is not available right now. Please use one of the links instead."
          : GENERIC_FAILURE
      );
      setStatus("error");
      toast.error("Message not sent");
    } catch {
      setFailure("Could not reach the server. Check your connection and try again.");
      setStatus("error");
      toast.error("Message not sent");
    }
  };

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className={cn(
          "border border-[var(--hud-line-strong)] bg-space-900/50 p-4 outline-none",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <CheckCircleIcon aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-ember" />
          <div>
            <p className="font-display text-lg font-semibold text-slate-50">Message sent</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-200">
              Thank you for reaching out. Your message is on its way.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            refocusForm.current = true;
            setErrors({});
            setStatus("idle");
          }}
          className={actionClass("ghost", "mt-4 w-full sm:w-auto")}
        >
          Send another
        </button>
      </div>
    );
  }

  const describe = (field: ContactField, extra?: string) =>
    [errors[field] ? errorId(field) : null, extra ?? null].filter(Boolean).join(" ") || undefined;

  const fieldError = (field: ContactField) =>
    errors[field] ? (
      <p id={errorId(field)} className="mt-1.5 flex items-start gap-1.5 text-sm text-ember">
        <ExclamationTriangleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <span className="sr-only">Error: </span>
          {errors[field]}
        </span>
      </p>
    ) : null;

  const inputClass = (field: ContactField) =>
    cn(INPUT, errors[field] ? "border-ember" : "border-ice/25 hover:border-ice/45");

  const label = "hud-label mb-1.5 block";
  const counterId = `${uid}-message-count`;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-busy={sending}
      className={cn("relative space-y-4", className)}
    >
      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor={fieldId("company")}>Company (leave this empty)</label>
        <input
          id={fieldId("company")}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId("name")} className={label}>
            Name <span className="normal-case tracking-normal text-slate-400">(optional)</span>
          </label>
          <input
            id={fieldId("name")}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => validateField("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe("name")}
            className={inputClass("name")}
          />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor={fieldId("email")} className={label}>
            Email
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => values.email && validateField("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describe("email")}
            className={inputClass("email")}
          />
          {fieldError("email")}
        </div>
      </div>

      <div>
        <label htmlFor={fieldId("subject")} className={label}>
          Subject
        </label>
        <input
          id={fieldId("subject")}
          name="subject"
          type="text"
          required
          value={values.subject}
          onChange={(e) => set("subject", e.target.value)}
          onBlur={() => values.subject && validateField("subject")}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={describe("subject")}
          className={inputClass("subject")}
        />
        {fieldError("subject")}
      </div>

      <div>
        <label htmlFor={fieldId("message")} className={label}>
          Message
        </label>
        <textarea
          id={fieldId("message")}
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          onBlur={() => values.message && validateField("message")}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe("message", counterId)}
          className={cn(inputClass("message"), "min-h-[120px] resize-y leading-relaxed")}
        />
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">{fieldError("message")}</div>
          <p id={counterId} className="hud-label shrink-0 normal-case tracking-normal">
            <span className="sr-only">Characters used: </span>
            {values.message.trim().length} / {CONTACT_LIMITS.messageMax}
          </p>
        </div>
      </div>

      {status === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 border border-ember/60 bg-ember/10 px-3 py-2.5 text-sm text-slate-50"
        >
          <ExclamationTriangleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
          <span>{failure || GENERIC_FAILURE}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className={actionClass("primary", "w-full")}
      >
        {sending ? (
          <>
            <Spinner />
            Sending…
          </>
        ) : (
          <>
            <PaperAirplaneIcon aria-hidden className="h-4 w-4" />
            {status === "error" ? "Try again" : "Send message"}
          </>
        )}
      </button>
    </form>
  );
}
