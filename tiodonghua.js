// TioDonghua Extension for Hayase
// Base URL: https://tiodonghua.com/

export default new class {
  constructor() {
    this.name = "TioDonghua";
    this.baseUrl = atob("aHR0cHM6Ly90aW9kb25naHVhLmNvbQ=="); // https://tiodonghua.com
  }

  async test() {
    try {
      const res = await fetch(`${this.baseUrl}/`, { method: "HEAD" });
      return res.ok;
    } catch (e) {
      throw new Error("TioDonghua: Sitio no disponible");
    }
  }

  async search(query) {
    try {
      const url = `${this.baseUrl}/directorio?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("TioDonghua: Error al obtener resultados");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // TioDonghua shares layout with TioAnime — .anime grid cards
      const items = doc.querySelectorAll(".anime");
      const results = [];

      for (const item of items) {
        const anchor = item.querySelector("a");
        const img = item.querySelector(".thumb img");
        const titleEl = item.querySelector("h3") || item.querySelector(".title");

        if (!anchor) continue;

        const href = anchor.getAttribute("href") || "";
        const link = href.startsWith("http") ? href : `${this.baseUrl}${href}`;
        const title = titleEl
          ? titleEl.textContent.trim()
          : anchor.getAttribute("title") || "";
        const image = img
          ? (img.getAttribute("src")?.startsWith("http")
              ? img.getAttribute("src")
              : `${this.baseUrl}${img.getAttribute("src")}`)
          : "";

        results.push({ title, link, image });
      }

      return results;
    } catch (e) {
      throw new Error(`TioDonghua: search() falló — ${e.message}`);
    }
  }

  async single(ids, info) {
    try {
      // ids[0] = URL completa del donghua
      const res = await fetch(ids[0]);
      if (!res.ok) throw new Error("TioDonghua: Error al cargar la página del donghua");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // TioDonghua (Tio-family) embeds episode list as JS var
      const scriptTags = doc.querySelectorAll("script");
      let episodes = [];

      for (const script of scriptTags) {
        const text = script.textContent;
        const match = text.match(/(?:var|let|const)\s+episodes\s*=\s*(\[[\s\S]*?\])\s*;/);
        if (match) {
          try {
            episodes = JSON.parse(match[1]);
          } catch (_) {}
          break;
        }
      }

      // Fallback: try anchor-based episode list
      if (episodes.length === 0) {
        const anchors = doc.querySelectorAll(".episodes-list a, .cap_list a, .episodio a");
        for (const a of anchors) {
          const href = a.getAttribute("href") || "";
          const link = href.startsWith("http") ? href : `${this.baseUrl}${href}`;
          const label = a.textContent.trim();
          if (link && label) {
            episodes.push({ title: label, id: link });
          }
        }
        return { info, episodes };
      }

      // Build episode URLs from slug + number
      const slugMatch = ids[0].match(/\/anime\/([^/]+)/);
      const slug = slugMatch ? slugMatch[1] : "";

      const episodeList = episodes.map((ep) => {
        const num = Array.isArray(ep) ? ep[0] : ep;
        return {
          title: `Episodio ${num}`,
          id: `${this.baseUrl}/ver/${slug}-${num}`,
        };
      });

      return { info, episodes: episodeList };
    } catch (e) {
      throw new Error(`TioDonghua: single() falló — ${e.message}`);
    }
  }
}
