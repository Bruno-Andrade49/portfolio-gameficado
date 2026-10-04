import { describe, expect, it } from "vitest";
import { themeScript } from "./theme-script";

type Env = { stored?: string | null; prefersLight?: boolean; storageThrows?: boolean; metas?: { content: string }[] };

function run({ stored = null, prefersLight = false, storageThrows = false, metas }: Env) {
  const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
  const listeners: ((e: { matches: boolean }) => void)[] = [];
  const document = metas
    ? { documentElement: root, querySelectorAll: () => metas }
    : { documentElement: root };
  const localStorage = {
    getItem: () => {
      if (storageThrows) throw new Error("bloqueado");
      return stored;
    },
  };
  const window = {
    matchMedia: () => ({ matches: prefersLight, addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb) }),
  };
  new Function("document", "localStorage", "window", themeScript)(document, localStorage, window);
  return { root, listeners };
}

describe("themeScript", () => {
  it("usa a preferência salva acima do sistema", () => {
    expect(run({ stored: "dark", prefersLight: true }).root.dataset.theme).toBe("dark");
    expect(run({ stored: "light", prefersLight: false }).root.dataset.theme).toBe("light");
  });

  it("sem preferência salva, segue o sistema e acompanha mudanças", () => {
    const { root, listeners } = run({ prefersLight: true });
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
    listeners[0]({ matches: false });
    expect(root.dataset.theme).toBe("dark");
  });

  it("atualiza a cor da barra do navegador", () => {
    const metas = [{ content: "" }, { content: "" }];
    run({ stored: "light", metas });
    expect(metas.map((m) => m.content)).toEqual(["#f4efe8", "#f4efe8"]);
    run({ stored: "dark", metas });
    expect(metas.map((m) => m.content)).toEqual(["#0f0d0e", "#0f0d0e"]);
  });

  it("ignora valor inválido salvo", () => {
    expect(run({ stored: "roxo", prefersLight: false }).root.dataset.theme).toBe("dark");
  });

  it("cai no escuro se o localStorage estiver bloqueado", () => {
    expect(run({ storageThrows: true, prefersLight: true }).root.dataset.theme).toBe("dark");
  });
});
