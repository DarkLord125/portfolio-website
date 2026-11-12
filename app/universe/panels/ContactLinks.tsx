import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandMedium,
  IconBrandX,
  IconDownload,
  IconExternalLink,
  IconMail,
  type Icon,
} from "@tabler/icons-react";
import { CONTACT } from "../content/profile";
import { ActionLink } from "./primitives";

const ICONS: Record<string, Icon> = {
  linkedin: IconBrandLinkedin,
  github: IconBrandGithub,
  x: IconBrandX,
  medium: IconBrandMedium,
};

const LINK =
  "focus-ring flex min-h-[44px] items-center gap-2 rounded-sm border border-ice/25 px-3 text-sm text-slate-100 transition-colors hover:border-ice/60 hover:bg-ice/10";

/** Email (only when configured), social links and the résumé download. */
export function ContactLinks() {
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-2">
        {CONTACT.email && (
          <li className="col-span-2">
            <a href={`mailto:${CONTACT.email}`} className={LINK}>
              <IconMail aria-hidden size={18} className="shrink-0 text-[var(--accent,#9fd0ff)]" />
              <span className="min-w-0 truncate">{CONTACT.email}</span>
            </a>
          </li>
        )}
        {CONTACT.links.map((link) => {
          const LinkIcon = ICONS[link.id] ?? IconExternalLink;
          return (
            <li key={link.id}>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                <LinkIcon aria-hidden size={18} className="shrink-0 text-[var(--accent,#9fd0ff)]" />
                <span>{link.label}</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ul>
      <ActionLink href={CONTACT.resume} download className="w-full">
        <IconDownload aria-hidden size={18} />
        Download résumé
      </ActionLink>
    </div>
  );
}
