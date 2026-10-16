import { education, jobs } from "@/data/experience";
import { attributes, profile } from "@/data/profile";
import { seo } from "@/data/seo";

type Node = Record<string, unknown> & { "@type": string };

export function structuredData(url: string): { "@context": string; "@graph": Node[] } {
  const person: Node = {
    "@type": "Person",
    "@id": `${url}/#person`,
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    url,
    image: `${url}${profile.photos.desk}`,
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
    alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.address.locality,
      addressRegion: profile.address.region,
      addressCountry: profile.address.country,
    },
    knowsAbout: attributes.map((a) => a.name),
  };
  if (profile.email) person.email = `mailto:${profile.email}`;
  const currentJob = jobs.find((j) => j.current);
  if (currentJob) person.worksFor = { "@type": "Organization", name: currentJob.company };

  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: seo.siteName,
        inLanguage: "pt-BR",
        publisher: { "@id": `${url}/#person` },
      },
    ],
  };
}
