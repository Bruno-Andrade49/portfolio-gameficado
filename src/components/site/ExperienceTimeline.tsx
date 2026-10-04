import Image from "next/image";
import { jobs, type Job } from "@/data/experience";
import { BulletList, Section, TagList } from "./ui";

export function ExperienceTimeline() {
  return (
    <Section
      id="experiencia"
      eyebrow="Carreira"
      title="Experiência profissional"
      intro="Quase 4 anos construindo produtos web. Hoje sou Pleno na Single Software, onde entrei como Júnior."
    >
      <ol className="grid gap-10 border-l-2 border-line pl-6 sm:pl-10">
        {jobs.map((job) => (
          <li key={job.id} className="relative">
            <span
              aria-hidden
              className={`absolute -left-[33px] top-6 size-4 border-2 border-accent sm:-left-[49px] ${
                job.current ? "bg-accent" : "bg-bg"
              }`}
            />
            <JobCard job={job} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <article className="pixel-box p-5 sm:p-7">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-pixel text-2xl leading-tight sm:text-3xl">{job.company}</h3>
        <p className="font-mono text-sm text-muted">{job.period}</p>
      </header>
      <p className="mt-1 text-sm text-muted">
        {job.team ? `${job.team} · ` : ""}
        {job.location}
      </p>

      <ol className="mt-6 grid gap-7">
        {job.roles.map((role) => (
          <li key={role.title} data-role={role.title}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h4 className="text-lg font-semibold text-text">{role.title}</h4>
              {role.end === null && (
                <span className="border-2 border-accent px-2 py-0.5 font-mono text-[11px] text-accent-text">
                  Atual
                </span>
              )}
              <span className="font-mono text-xs text-muted">{role.period}</span>
            </div>
            <div className="mt-3">
              <BulletList items={role.bullets} />
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <TagList items={job.stack} />
      </div>

      {job.gallery && (
        <div className="mt-7 border-t-2 border-line pt-5">
          <h4 className="font-pixel text-lg">Trabalhos para clientes</h4>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {job.gallery.map((g) => (
              <li key={g.src}>
                <figure>
                  <div className="relative aspect-[16/10] overflow-hidden border-2 border-line bg-panel-2">
                    <Image
                      src={g.src}
                      alt={`Tela do projeto ${g.title}`}
                      fill
                      sizes="(min-width: 640px) 300px, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <figcaption className="mt-2">
                    <span className="block font-semibold text-text">
                      {g.href ? (
                        <a href={g.href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-accent-text">
                          {g.title}
                        </a>
                      ) : (
                        g.title
                      )}
                    </span>
                    <span className="text-sm leading-snug text-muted">{g.caption}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
