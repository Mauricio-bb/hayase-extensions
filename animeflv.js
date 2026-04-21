// AnimeFLV Extension for Hayase
// Base URL: https://www4.animeflv.net/

export default new class {
  constructor() {
    this.name = "AnimeFLV";
    this.baseUrl = atob("aHR0cHM6Ly93d3c0LmFuaW1lZmx2Lm5ldA=="); // https://www4.animeflv.net
  }

  async test() {
    try {
      const res = await fetch(`${this.baseUrl}/`, { method: "HEAD" });
      return res.ok;
    } catch (e) {
      throw new Error("AnimeFLV: Sitio no disponible");
    }
  }

  async search(query) {
    try {
      const url = `${this.baseUrl}/browse?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("AnimeFLV: Error al obtener resultados");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const items = doc.querySelectorAll("ul.ListAnimes li article");
      const results = [];

      for (const item of items) {
        const anchor = item.querySelector("a");
        const img = item.querySelector("figure img");
        const titleEl = item.querySelector(".Title");

        if (!anchor || !titleEl) continue;

        const link = anchor.href || `${this.baseUrl}${anchor.getAttribute("href")}`;
        const title = titleEl.textContent.trim();
        const image = img
          ? img.src || `${this.baseUrl}${img.getAttribute("src")}`
          : "";

        results.push({ title, link, image });
      }

      return results;
    } catch (e) {
      throw new Error(`AnimeFLV: search() falló — ${e.message}`);
    }
  }

  async single(ids, info) {
    try {
      // ids[0] = URL completa del anime
      const res = await fetch(ids[0]);
      if (!res.ok) throw new Error("AnimeFLV: Error al cargar la página del anime");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // AnimeFLV embeds episode list as a JS variable: var episodes = [...]
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

      // Extract anime slug from URL to build episode links
      const slugMatch = ids[0].match(/\/anime\/([^/]+)/);
      const slug = slugMatch ? slugMatch[1] : "";

      const episodeList = episodes.map(([ep]) => ({
        title: `Episodio ${ep}`,
        id: `${this.baseUrl}/ver/${slug}-${ep}`,
      }));

      return { info, episodes: episodeList };
    } catch (e) {
      throw new Error(`AnimeFLV: single() falló — ${e.message}`);
    }
  }
}
