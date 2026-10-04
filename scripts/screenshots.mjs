import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const USER = "Bruno-Andrade49";
const OUT_DIR = path.resolve("public/projects");
const MANIFEST = path.resolve("src/data/screenshots.json");
const CARDS = path.resolve("src/data/github-cards.json");

const SHOWCASE = [
  "bruno-financas",
  "managment-clinic",
  "conecta",
  "fullstack-barberBooking",
  "DTMoney",
  "new-portfolio-bruno",
  "ssr-repository",
  "csr-repository",
  "springboot-tests",
  "Projeto_Site_Impulse",
  "petshop_BrunoApp",
  "BrMovie-SpringReact",
].map((name) => name.toLowerCase());

const inShowcase = (r) => SHOWCASE.includes(r.name.toLowerCase());

const BROKEN_PAGE =
  /application error|page (doesn't|does not|could not be found)|404|deployment_not_found/i;

const normalize =(url) => (url.startsWith("http") ? url : `https://${url}`);

async function getRepos() {
  const headers = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};
  const res = await fetch(
    `https://api.github.com/users/${USER}/repos?per_page=100`,
    { headers },
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

function getTargets(repos) {
  return repos
    .filter((r) => r.homepage && !r.fork && inShowcase(r))
    .map((r) => ({ slug: r.name.toLowerCase(), url: normalize(r.homepage) }));
}

async function downloadCards(repos, shots) {
  const dir = path.join(OUT_DIR, "github");
  await mkdir(dir, { recursive: true });
  const cards = {};
  for (const r of repos) {
    const slug = r.name.toLowerCase();
    if (r.fork || !inShowcase(r) || shots[slug]) continue;
    await new Promise((ok) => setTimeout(ok, 250));
    const res = await fetch(`https://opengraph.githubassets.com/1/${USER}/${r.name}`);
    if (!res.ok) {
      console.warn(`fail card ${slug}: ${res.status}`);
      continue;
    }
    await writeFile(path.join(dir, `${slug}.png`), Buffer.from(await res.arrayBuffer()));
    cards[slug] = `/projects/github/${slug}.png`;
  }
  await writeFile(CARDS, JSON.stringify(cards, null, 2) + "\n");
  console.log(`${Object.keys(cards).length} cards do GitHub salvos.`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const repos = await getRepos();

  if (process.argv.includes("--cards-only")) {
    const shots = JSON.parse(await readFile(MANIFEST, "utf8"));
    return downloadCards(repos, shots);
  }

  const targets = getTargets(repos);
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "pt-BR",
  });
  const manifest = {};

  for (const { slug, url } of targets) {
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
      await page.waitForTimeout(2500);
      const text = await page.innerText("body").catch(() => "");
      if (BROKEN_PAGE.test(text) && text.length < 600) {
        throw new Error("página quebrada / fora do ar");
      }
      const file = `${slug}.jpg`;
      await page.screenshot({
        path: path.join(OUT_DIR, file),
        type: "jpeg",
        quality: 80,
      });
      manifest[slug] = `/projects/${file}`;
      console.log(`ok   ${slug}  <- ${url}`);
    } catch (err) {
      console.warn(`fail ${slug}  <- ${url}: ${err.message.split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n${Object.keys(manifest).length} prints salvos.`);
  await downloadCards(repos, manifest);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
