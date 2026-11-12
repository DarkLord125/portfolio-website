import { getDestination } from "../config/destinations";
import { CONTACT } from "../content/profile";
import { ContactForm } from "./ContactForm";
import { ContactLinks } from "./ContactLinks";
import { HoloPanel, HoloSection } from "./HoloPanel";

export function ContactPanel() {
  const destination = getDestination("contact");
  const { palette } = destination;
  return (
    <HoloPanel id="contact" title={destination.name} subtitle={destination.tagline}>
      <div className="relative overflow-hidden rounded-md border border-[var(--hud-line)] bg-space-900/50 p-4">
        {/* The habitable world's own colours, kept to a thin horizon line. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5"
          style={{
            background: `linear-gradient(90deg, ${palette.secondary}, ${palette.primary}, ${palette.atmosphere})`,
          }}
        />
        <blockquote className="text-balance font-display text-xl font-medium leading-snug text-slate-50 md:text-2xl">
          {CONTACT.quote}
        </blockquote>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">{CONTACT.blurb}</p>
      </div>

      <HoloSection label="Channels">
        <ContactLinks />
      </HoloSection>

      <HoloSection label="Send a message">
        <ContactForm />
      </HoloSection>
    </HoloPanel>
  );
}
