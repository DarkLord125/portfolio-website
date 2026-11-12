import Image from "next/image";
import { getDestination } from "../config/destinations";
import { ABOUT, PROFILE } from "../content/profile";
import {
  ChipList,
  DataList,
  DataRow,
  HoloCard,
  HoloPanel,
  HoloSection,
} from "./HoloPanel";

export function AboutPanel() {
  const destination = getDestination("about");
  return (
    <HoloPanel id="about" title={destination.name} subtitle={destination.tagline}>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0 border border-ice/30 p-1">
          <span aria-hidden className="absolute -left-px -top-px h-2 w-2 border-l border-t border-[var(--accent)]" />
          <span aria-hidden className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-[var(--accent)]" />
          <Image
            src={PROFILE.photo}
            alt={`Portrait of ${PROFILE.name}`}
            width={80}
            height={80}
            className="h-20 w-20 object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-slate-50">{PROFILE.name}</p>
          <p className="hud-label mt-1">{ABOUT.headline}</p>
        </div>
      </div>

      <HoloSection label="Identity">
        <DataList>
          {ABOUT.facts.map((fact) => (
            <DataRow key={fact.label} label={fact.label} value={fact.value} />
          ))}
        </DataList>
      </HoloSection>

      <HoloSection label="Profile">
        <p className="text-sm leading-relaxed text-slate-200">{ABOUT.intro}</p>
      </HoloSection>

      <HoloSection label="Interests">
        <ul className="space-y-2">
          {ABOUT.interests.map((interest) => (
            <li key={interest.title}>
              <HoloCard title={interest.title}>{interest.detail}</HoloCard>
            </li>
          ))}
        </ul>
      </HoloSection>

      <HoloSection label="Engineering philosophy">
        <ol className="space-y-2">
          {ABOUT.philosophy.map((item, i) => (
            <li key={item.title}>
              <HoloCard title={item.title} index={i + 1}>
                {item.detail}
              </HoloCard>
            </li>
          ))}
        </ol>
      </HoloSection>

      <HoloSection label="Certifications">
        <ChipList items={ABOUT.certifications} />
      </HoloSection>

      <HoloSection label="Hobbies">
        <ChipList items={ABOUT.hobbies} />
      </HoloSection>
    </HoloPanel>
  );
}
