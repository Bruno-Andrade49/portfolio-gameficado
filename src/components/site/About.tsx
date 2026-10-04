import { education, languages, skills } from "@/data/experience";
import { profile } from "@/data/profile";
import { Section, TagList } from "./ui";

export function About() {
  return (
    <Section id="sobre" eyebrow="Perfil" title="Sobre mim">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid max-w-[65ch] content-start gap-4 text-lg leading-relaxed text-muted">
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="grid content-start gap-4">
          <div className="pixel-box p-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">Formação</h3>
            <p className="mt-2 font-semibold text-text">{education.course}</p>
            <p className="text-sm text-muted">
              {education.school} · {education.period}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{education.summary}</p>
          </div>
          <div className="pixel-box p-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent-text">Idiomas</h3>
            <ul className="mt-2 grid gap-1">
              {languages.map((l) => (
                <li key={l.name} className="flex justify-between gap-4">
                  <span className="text-text">{l.name}</span>
                  <span className="text-right text-sm text-muted">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <h3 className="mt-14 font-pixel text-2xl">Competências técnicas</h3>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {skills.map((s) => (
          <li key={s.group} className="pixel-box p-5">
            <h4 className="font-semibold text-text">{s.group}</h4>
            <div className="mt-3">
              <TagList items={s.items} label={s.group} />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
