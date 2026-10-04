import type { Metadata } from "next";
import { About } from "@/components/site/About";
import { BackendProjects } from "@/components/site/BackendProjects";
import { Contact } from "@/components/site/Contact";
import { ExperienceTimeline } from "@/components/site/ExperienceTimeline";
import { FrontendProjects } from "@/components/site/FrontendProjects";
import { Hero } from "@/components/site/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site-url";
import { structuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const projects = await getProjects();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(siteUrl())).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main>
        <Hero />
        <ExperienceTimeline />
        <About />
        <FrontendProjects projects={projects} />
        <BackendProjects projects={projects} />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
